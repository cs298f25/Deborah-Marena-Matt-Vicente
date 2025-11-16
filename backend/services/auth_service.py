from __future__ import annotations

from typing import Optional

from backend.models import User, db
from backend.repositories import user_repository


class AuthService:
    """Service encapsulating authentication-related operations."""

    @staticmethod
    def login_or_create_user(email: str) -> User:
        user = user_repository.get_by_email(email)
        if not user:
            name = email.split("@")[0].replace(".", " ").title()
            user = user_repository.create_user(email=email, name=name)
            db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return user_repository.get_by_id(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        return user_repository.get_by_email(email)

