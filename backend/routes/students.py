"""
Routes for roster student management (CSV upload + pagination).
"""

from __future__ import annotations

import csv
from io import BytesIO, StringIO

from flask import Blueprint, jsonify, request, send_file
from sqlalchemy.exc import SQLAlchemyError

from backend.models import db
from backend.services import student_service
from backend.services.student_service import RosterStudentRow

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


@students_bp.get("")
def list_students():
    page = request.args.get("page", default=1, type=int)
    page_size = request.args.get("page_size", default=20, type=int)
    search = request.args.get("search", default="", type=str)

    data = student_service.list_students(page=page, page_size=page_size, search=search)
    return jsonify(data)


@students_bp.post("/upload")
def upload_students():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Missing filename"}), 400

    try:
        stream = StringIO(file.stream.read().decode("utf-8"))
    except UnicodeDecodeError:
        return jsonify({"error": "Unable to decode file; make sure it is UTF-8"}), 400

    reader = csv.DictReader(stream)
    rows: list[RosterStudentRow] = []

    for csv_row in reader:
        rows.append(
            RosterStudentRow(
                first_name=csv_row.get("first_name", "") or "",
                last_name=csv_row.get("last_name", "") or "",
                email=csv_row.get("email", "") or "",
            )
        )

    try:
        summary, errors = student_service.bulk_upsert(
            enumerate(rows, start=2)  # header is line 1
        )
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Unable to save roster"}), 500

    return jsonify({"summary": summary, "errors": errors})


@students_bp.get("/template")
def download_template():
    csv_content = student_service.template_csv()
    buffer = BytesIO()
    buffer.write(csv_content.encode("utf-8"))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="text/csv",
        as_attachment=True,
        download_name="students_template.csv",
    )

