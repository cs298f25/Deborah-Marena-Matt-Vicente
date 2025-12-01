"""
Service layer for roster student operations.

Provides pagination helpers and CSV upsert utilities so that the
Flask routes remain thin.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, Tuple

from sqlalchemy import func, or_

from backend.models import RosterStudent, UploadHistory, db


@dataclass
class RosterStudentRow:
    first_name: str
    last_name: str
    email: str


def list_students(
    page: int,
    page_size: int,
    search: str | None = None,
    include_deleted: bool = False,
    class_name: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    """Return paginated roster students with filtering and sorting."""

    query = RosterStudent.query

    # Filter soft-deleted by default
    if not include_deleted:
        query = query.filter(RosterStudent.deleted_at.is_(None))

    # Filter by class name
    if class_name:
        query = query.filter(RosterStudent.class_name == class_name)

    # Search filter
    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(RosterStudent.first_name).like(pattern),
                func.lower(RosterStudent.last_name).like(pattern),
                func.lower(RosterStudent.email).like(pattern),
            )
        )

    # Sorting
    sort_column = {
        "email": RosterStudent.email,
        "first_name": RosterStudent.first_name,
        "last_name": RosterStudent.last_name,
        "created_at": RosterStudent.created_at,
        "class_name": RosterStudent.class_name,
    }.get(sort_by, RosterStudent.created_at)

    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    pagination = query.paginate(page=page, per_page=page_size, error_out=False)

    return {
        "items": [student.to_dict() for student in pagination.items],
        "page": pagination.page,
        "page_size": pagination.per_page,
        "total": pagination.total,
        "total_pages": pagination.pages,
    }


def bulk_upsert(
    rows: Iterable[Tuple[int, RosterStudentRow]]
) -> tuple[dict, list[dict]]:
    """
    Upsert roster students.

    Returns (summary, errors).
    """

    inserted = updated = skipped = 0
    errors: list[dict] = []

    for line_number, row in rows:
        first_name = row.first_name.strip()
        last_name = row.last_name.strip()
        email = row.email.strip().lower()

        if not first_name or not last_name or not email:
            errors.append(
                {
                    "line": line_number,
                    "reason": "Missing first_name/last_name/email",
                }
            )
            skipped += 1
            continue

        existing = RosterStudent.query.filter_by(email=email).first()
        if existing:
            existing.first_name = first_name
            existing.last_name = last_name
            updated += 1
        else:
            db.session.add(
                RosterStudent(
                    email=email, first_name=first_name, last_name=last_name
                )
            )
            inserted += 1

    db.session.commit()

    summary = {
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped,
        "total_processed": inserted + updated + skipped,
    }

    return summary, errors


def add_students_from_csv(
    rows: Iterable[Tuple[int, RosterStudentRow]], filename: str, user_id: int | None = None
) -> tuple[dict, list[dict], UploadHistory]:
    """
    Add students from CSV to the roster bank.
    
    Returns (summary, errors, upload_history).
    """
    added = restored = skipped = 0
    errors: list[dict] = []
    changes: list[dict] = []

    for line_number, row in rows:
        first_name = row.first_name.strip()
        last_name = row.last_name.strip()
        email = row.email.strip().lower()

        if not first_name or not last_name or not email:
            errors.append(
                {
                    "line": line_number,
                    "email": email,
                    "reason": "Missing first_name/last_name/email",
                }
            )
            skipped += 1
            continue

        # Check if student exists (not soft-deleted)
        existing = RosterStudent.query.filter_by(
            email=email, deleted_at=None
        ).first()
        
        if existing:
            # Already exists, skip
            skipped += 1
            changes.append({
                "type": "skipped",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "action": f"{first_name} {last_name} already exists",
            })
            continue

        # Check if soft-deleted (can restore)
        deleted = RosterStudent.query.filter_by(email=email).filter(
            RosterStudent.deleted_at.isnot(None)
        ).first()
        
        if deleted:
            # Restore and update
            deleted.deleted_at = None
            deleted.first_name = first_name
            deleted.last_name = last_name
            deleted.last_updated_via = "csv_add"
            restored += 1
            changes.append({
                "type": "restored",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "action": f"{first_name} {last_name} restored",
            })
        else:
            # Create new
            student = RosterStudent(
                email=email,
                first_name=first_name,
                last_name=last_name,
                last_updated_via="csv_add",
            )
            db.session.add(student)
            added += 1
            changes.append({
                "type": "added",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "action": f"{first_name} {last_name} added",
            })

    # Create upload history record
    upload_history = UploadHistory(
        filename=filename,
        uploaded_by=user_id,
        action="add",
        students_added=added,
        students_restored=restored,
        students_skipped=skipped,
        total_processed=added + restored + skipped,
        change_log=json.dumps(changes),
    )
    db.session.add(upload_history)
    db.session.flush()

    # Link students to upload
    for change in changes:
        if change["type"] in ("added", "restored"):
            student = RosterStudent.query.filter_by(email=change["email"]).first()
            if student:
                student.last_upload_id = upload_history.id

    db.session.commit()

    summary = {
        "added": added,
        "restored": restored,
        "skipped": skipped,
        "total_processed": added + restored + skipped,
    }

    return summary, errors, upload_history


def drop_students_from_csv(
    rows: Iterable[Tuple[int, RosterStudentRow]], filename: str, user_id: int | None = None
) -> tuple[dict, list[dict], UploadHistory]:
    """
    Drop (soft delete) students from CSV.
    
    Returns (summary, errors, upload_history).
    """
    removed = not_found = skipped = 0
    errors: list[dict] = []
    changes: list[dict] = []

    for line_number, row in rows:
        first_name = row.first_name.strip()
        last_name = row.last_name.strip()
        email = row.email.strip().lower()

        if not first_name or not last_name or not email:
            errors.append(
                {
                    "line": line_number,
                    "email": email,
                    "reason": "Missing first_name/last_name/email",
                }
            )
            skipped += 1
            continue

        # Find active student (not soft-deleted)
        student = RosterStudent.query.filter_by(
            email=email, deleted_at=None
        ).first()

        if student:
            # Soft delete
            student.deleted_at = datetime.utcnow()
            student.last_updated_via = "csv_drop"
            removed += 1
            changes.append({
                "type": "removed",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "action": f"{first_name} {last_name} removed",
            })
        else:
            # Not found in active roster
            not_found += 1
            changes.append({
                "type": "not_found",
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "action": f"{first_name} {last_name} not found in active roster",
            })

    # Create upload history record
    upload_history = UploadHistory(
        filename=filename,
        uploaded_by=user_id,
        action="drop",
        students_removed=removed,
        students_not_found=not_found,
        students_skipped=skipped,
        total_processed=removed + not_found + skipped,
        change_log=json.dumps(changes),
    )
    db.session.add(upload_history)
    db.session.flush()

    # Link students to upload
    for change in changes:
        if change["type"] == "removed":
            student = RosterStudent.query.filter_by(email=change["email"]).first()
            if student:
                student.last_upload_id = upload_history.id

    db.session.commit()

    summary = {
        "removed": removed,
        "not_found": not_found,
        "skipped": skipped,
        "total_processed": removed + not_found + skipped,
    }

    return summary, errors, upload_history


def template_csv() -> str:
    """Return the CSV template string for downloads."""

    return (
        "first_name,last_name,email\n"
        "Ada,Lovelace,ada@example.com\n"
        "Alan,Turing,alan@example.com\n"
    )

