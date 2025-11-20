from __future__ import annotations

from typing import Optional

from backend.models import User, db


def get_by_id(user_id: int) -> Optional[User]:
    return db.session.get(User, user_id)


def get_by_email(email: str) -> Optional[User]:
    return db.session.execute(db.select(User).filter_by(email=email)).scalar_one_or_none()


def create_user(email: str, name: str, role: str = "student") -> User:
    user = User(email=email, name=name, role=role)
    db.session.add(user)
    db.session.flush()
    return user

