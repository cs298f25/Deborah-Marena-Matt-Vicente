from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.repositories import topic_repository, user_repository
from backend.services.progress_service import ProgressService
from backend.services.response_service import ResponseService

responses_bp = Blueprint("responses", __name__, url_prefix="/api/responses")


@responses_bp.post("")
def create_response():
    """Persist a new student response and update progress metrics."""

    payload = request.get_json(silent=True) or {}

    is_valid, message = ResponseService.validate_payload(payload)
    if not is_valid:
        return jsonify({"error": message}), 400

    user = user_repository.get_by_id(payload["user_id"])
    if not user:
        return (
            jsonify(
                {"error": "NotFound", "message": f"User {payload['user_id']} does not exist."}
            ),
            404,
        )

    topic = topic_repository.get_by_id(payload["topic"])
    if not topic:
        return (
            jsonify(
                {"error": "NotFound", "message": f"Topic '{payload['topic']}' does not exist."}
            ),
            404,
        )

    response = ResponseService.create_response(payload)
    ProgressService.increment_questions_answered(user_id=user.id, topic_id=topic.id)

    return (
        jsonify({"message": "Response recorded successfully.", "response": response.to_dict()}),
        201,
    )


@responses_bp.get("/student/<int:student_id>")
def get_responses_for_student(student_id: int):
    """Return all responses recorded for a given student."""

    responses = ResponseService.get_student_responses(student_id)
    return jsonify({"responses": [response.to_dict() for response in responses]}), 200
