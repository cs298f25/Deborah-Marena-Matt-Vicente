from __future__ import annotations

from typing import Iterable, Optional

from sqlalchemy import func

from backend.models import Topic, db


def get_all(order: bool = True) -> Iterable[Topic]:
    query = db.select(Topic)
    if order:
        query = query.order_by(Topic.order_index.asc(), Topic.created_at.asc())
    return db.session.execute(query).scalars().all()


def get_visible(order: bool = True) -> Iterable[Topic]:
    query = db.select(Topic).filter_by(is_visible=True)
    if order:
        query = query.order_by(Topic.order_index.asc(), Topic.created_at.asc())
    return db.session.execute(query).scalars().all()


def get_by_id(topic_id: str) -> Optional[Topic]:
    return db.session.get(Topic, topic_id)


def create_topic(
    topic_id: str,
    name: str,
    *,
    is_visible: bool = True,
    order_index: Optional[int] = None,
) -> Topic:
    if order_index is None:
        order_index = db.session.execute(db.select(func.max(Topic.order_index))).scalar()
        order_index = (order_index or 0) + 1

    topic = Topic(
        id=topic_id,
        name=name,
        is_visible=is_visible,
        order_index=order_index,
    )
    db.session.add(topic)
    db.session.flush()
    return topic


def update_topic(topic: Topic, **fields) -> Topic:
    for key, value in fields.items():
        setattr(topic, key, value)
    db.session.flush()
    return topic

