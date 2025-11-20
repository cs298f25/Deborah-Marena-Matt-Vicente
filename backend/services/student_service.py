"""
Service layer for roster student operations.

Provides pagination helpers and CSV upsert utilities so that the
Flask routes remain thin.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Tuple

from sqlalchemy import func, or_

from backend.models import RosterStudent, db


@dataclass
class RosterStudentRow:
    first_name: str
    last_name: str
    email: str


def list_students(page: int, page_size: int, search: str | None = None) -> dict:
    """Return paginated roster students, applying case-insensitive search."""

    query = RosterStudent.query

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(RosterStudent.first_name).like(pattern),
                func.lower(RosterStudent.last_name).like(pattern),
                func.lower(RosterStudent.email).like(pattern),
            )
        )

    pagination = query.order_by(RosterStudent.created_at.desc()).paginate(
        page=page, per_page=page_size, error_out=False
    )

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


def template_csv() -> str:
    """Return the CSV template string for downloads."""

    return (
        "first_name,last_name,email\n"
        "Ada,Lovelace,ada@example.com\n"
        "Alan,Turing,alan@example.com\n"
    )

