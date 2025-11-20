from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.report_service import ReportService

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")


@reports_bp.get("/student/<int:student_id>")
def get_student_report(student_id: int):
    report = ReportService.get_student_report(student_id)
    if not report:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(report), 200


@reports_bp.get("/topic/<string:topic_id>")
def get_topic_report(topic_id: str):
    report = ReportService.get_topic_report(topic_id)
    if not report:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify(report), 200


@reports_bp.get("/class/overview")
def get_class_overview():
    overview = ReportService.get_class_overview()
    return jsonify(overview), 200


@reports_bp.get("/question/<string:topic_id>/analytics")
def get_question_analytics(topic_id: str):
    subtopic_type = request.args.get("subtopic_type")
    analytics = ReportService.get_question_analytics(topic_id, subtopic_type=subtopic_type)
    return jsonify(analytics), 200

