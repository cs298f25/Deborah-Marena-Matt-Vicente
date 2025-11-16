from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.models import StudentProgress, Topic
from backend.repositories import topic_repository, user_repository
from backend.services.progress_service import ProgressService

progress_bp = Blueprint("progress", __name__, url_prefix="/api/progress")


@progress_bp.get("/<int:user_id>")
def get_user_progress(user_id: int):
    """Return progress for all topics for the requested user."""

    user = user_repository.get_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    progress_records = ProgressService.get_user_progress(user_id)
    topics = {record.topic: topic_repository.get_by_id(record.topic) for record in progress_records}
    progress_payload = [
        _serialise_progress(record, topics.get(record.topic)) for record in progress_records
    ]

    return (
        jsonify(
            {
                "user_id": user.id,
                "user_name": user.name,
                "progress": progress_payload,
            }
        ),
        200,
    )


@progress_bp.get("/<int:user_id>/<string:topic_id>")
def get_topic_progress(user_id: int, topic_id: str):
    """Return progress for a specific topic for the requested user."""

    if not user_repository.get_by_id(user_id):
        return jsonify({"error": "User not found"}), 404

    topic = topic_repository.get_by_id(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    progress = ProgressService.get_topic_progress(user_id, topic_id)
    if not progress:
        return jsonify({"error": "Progress not found for this user and topic"}), 404

    return jsonify(_serialise_progress(progress, topic)), 200


@progress_bp.put("/<int:user_id>/<string:topic_id>")
def update_topic_progress(user_id: int, topic_id: str):
    """Create or update a progress record for a given user and topic."""

    payload = request.get_json(silent=True) or {}

    if "subtopics_completed" not in payload:
        return jsonify({"error": "Missing required field: subtopics_completed"}), 400
    if "total_subtopics" not in payload:
        return jsonify({"error": "Missing required field: total_subtopics"}), 400

    try:
        subtopics_completed = int(payload["subtopics_completed"])
        total_subtopics = int(payload["total_subtopics"])
    except (TypeError, ValueError):
        return jsonify({"error": "subtopics_completed and total_subtopics must be integers"}), 400

    if subtopics_completed < 0:
        return jsonify({"error": "subtopics_completed must be greater than or equal to 0"}), 400
    if total_subtopics <= 0:
        return jsonify({"error": "total_subtopics must be greater than 0"}), 400

    if not user_repository.get_by_id(user_id):
        return jsonify({"error": "User not found"}), 404

    topic = topic_repository.get_by_id(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    progress, created = ProgressService.update_or_create_progress(
        user_id,
        topic_id,
        {
            "subtopics_completed": subtopics_completed,
            "total_subtopics": total_subtopics,
        },
    )

    response_payload = _serialise_progress(progress, topic)
    message = "Progress created successfully" if created else "Progress updated successfully"
    return jsonify({"message": message, "progress": response_payload}), 200


@progress_bp.post("/<int:user_id>/<string:topic_id>/increment")
def increment_questions_answered(user_id: int, topic_id: str):
    """Increment the number of questions answered for a topic."""

    if not user_repository.get_by_id(user_id):
        return jsonify({"error": "User not found"}), 404

    if not topic_repository.get_by_id(topic_id):
        return jsonify({"error": "Topic not found"}), 404

    progress = ProgressService.increment_questions_answered(user_id=user_id, topic_id=topic_id)
    return jsonify(
        {"message": "Progress incremented", "questions_answered": progress.questions_answered}
    ), 200


def _serialise_progress(progress: StudentProgress, topic: Topic | None = None) -> dict:
    """Convert a progress model into an API-friendly dictionary."""

    if topic is None:
        topic = topic_repository.get_by_id(progress.topic)

    total_subtopics = progress.total_subtopics or 0
    subtopics_completed = progress.subtopics_completed or 0
    completion_percentage = (
        (subtopics_completed / total_subtopics) * 100 if total_subtopics else 0.0
    )

    return {
        "user_id": progress.user_id,
        "topic": progress.topic,
        "topic_name": topic.name if topic else progress.topic,
        "subtopics_completed": subtopics_completed,
        "total_subtopics": total_subtopics,
        "completion_percentage": round(completion_percentage, 2),
        "questions_answered": progress.questions_answered or 0,
        "last_accessed": (
            progress.last_accessed.isoformat() if progress.last_accessed else None
        ),
    }

