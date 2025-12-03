from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request, current_app

from backend.models import Topic
from backend.services.topic_service import TopicService

topics_bp = Blueprint("topics", __name__, url_prefix="/api/topics")


def get_topic_service():
    return current_app.config.get("TOPIC_SERVICE", TopicService)


@topics_bp.get("")
def get_topics():
    """Return topics filtered by the requester's role."""

    role = (request.args.get("role") or "student").lower()
    service = get_topic_service()
    topics = service.list_topics(role)
    return jsonify({"topics": [_serialise_topic_basic(topic) for topic in topics]}), 200


@topics_bp.get("/<string:topic_id>")
def get_topic(topic_id: str):
    """Return metadata for a single topic."""

    service = get_topic_service()
    topic = service.get_topic(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404
    return jsonify(_serialise_topic_detail(topic)), 200


@topics_bp.patch("/<string:topic_id>/visibility")
def update_topic_visibility(topic_id: str):
    """Toggle the visibility of a topic."""

    payload = request.get_json(silent=True) or {}

    if "is_visible" not in payload:
        return jsonify({"error": "Missing required field: is_visible"}), 400

    is_visible = payload["is_visible"]
    if not isinstance(is_visible, bool):
        return jsonify({"error": "is_visible must be a boolean"}), 400

    service = get_topic_service()
    topic = service.set_visibility(topic_id, is_visible=is_visible)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    return (
        jsonify(
            {
                "message": "Topic visibility updated successfully",
                "topic": _serialise_topic_basic(topic),
            }
        ),
        200,
    )


@topics_bp.post("")
def create_topic():
    """Create a new topic record."""

    payload = request.get_json(silent=True) or {}

    for field in ("id", "name"):
        if field not in payload or payload[field] in (None, ""):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    topic_id = str(payload["id"])
    name = str(payload["name"])

    service = get_topic_service()
    if service.get_topic(topic_id):
        return jsonify({"error": "Topic with this ID already exists"}), 409

    is_visible = payload.get("is_visible", True)
    if not isinstance(is_visible, bool):
        return jsonify({"error": "is_visible must be a boolean"}), 400

    order_index = payload.get("order_index")
    if order_index is not None:
        try:
            order_index = int(order_index)
        except (TypeError, ValueError):
            return jsonify({"error": "order_index must be an integer"}), 400

    topic = service.create_topic(
        topic_id,
        name,
        is_visible=is_visible,
        order_index=order_index,
    )

    return (
        jsonify(
            {
                "message": "Topic created successfully",
                "topic": _serialise_topic_detail(topic),
            }
        ),
        201,
    )


@topics_bp.put("/<string:topic_id>")
def update_topic(topic_id: str):
    """Update metadata for an existing topic."""

    payload = request.get_json(silent=True) or {}

    if "id" in payload and payload["id"] != topic_id:
        return jsonify({"error": "Cannot change topic ID"}), 400

    update_fields = {}
    if "name" in payload and payload["name"] not in (None, ""):
        update_fields["name"] = str(payload["name"])

    if "order_index" in payload:
        try:
            update_fields["order_index"] = int(payload["order_index"])
        except (TypeError, ValueError):
            return jsonify({"error": "order_index must be an integer"}), 400

    if "is_visible" in payload:
        if not isinstance(payload["is_visible"], bool):
            return jsonify({"error": "is_visible must be a boolean"}), 400
        update_fields["is_visible"] = payload["is_visible"]

    service = get_topic_service()
    topic = service.update_topic(topic_id, **update_fields)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    return (
        jsonify(
            {
                "message": "Topic updated successfully",
                "topic": _serialise_topic_basic(topic),
            }
        ),
        200,
    )


def _serialise_topic_basic(topic: Topic) -> dict:
    """Serialize a Topic model to a minimal representation."""

    return {
        "id": topic.id,
        "name": topic.name,
        "is_visible": bool(topic.is_visible),
        "order_index": topic.order_index,
    }


def _serialise_topic_detail(topic: Topic) -> dict:
    """Serialize a Topic model with creation metadata."""

    data = _serialise_topic_basic(topic)
    created_at: datetime | None = topic.created_at
    data["created_at"] = created_at.isoformat() if created_at else None
    return data
