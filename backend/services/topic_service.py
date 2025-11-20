from __future__ import annotations

from typing import Iterable, Optional

from backend.models import Topic, db
from backend.repositories import topic_repository


class TopicService:
    """Service providing topic-management behaviour."""

    @staticmethod
    def list_topics(role: str = "student") -> Iterable[Topic]:
        if role == "instructor":
            return topic_repository.get_all()
        return topic_repository.get_visible()

    @staticmethod
    def get_topic(topic_id: str) -> Optional[Topic]:
        return topic_repository.get_by_id(topic_id)

    @staticmethod
    def set_visibility(topic_id: str, *, is_visible: bool) -> Optional[Topic]:
        topic = topic_repository.get_by_id(topic_id)
        if not topic:
            return None
        topic_repository.update_topic(topic, is_visible=is_visible)
        db.session.commit()
        return topic

    @staticmethod
    def create_topic(
        topic_id: str,
        name: str,
        *,
        is_visible: bool = True,
        order_index: Optional[int] = None,
    ) -> Topic:
        topic = topic_repository.create_topic(
            topic_id, name, is_visible=is_visible, order_index=order_index
        )
        db.session.commit()
        return topic

    @staticmethod
    def update_topic(topic_id: str, **fields) -> Optional[Topic]:
        topic = topic_repository.get_by_id(topic_id)
        if not topic:
            return None
        topic_repository.update_topic(topic, **fields)
        db.session.commit()
        return topic

