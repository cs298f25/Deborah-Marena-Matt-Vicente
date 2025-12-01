from __future__ import annotations

from typing import Optional

from backend.models import User, db
from backend.repositories import user_repository


class AuthService:
    """Service encapsulating authentication-related operations."""

    # List of emails that should be assigned instructor role
    INSTRUCTOR_EMAILS = {"bush@moravian.edu"}

    @staticmethod
    def login_or_create_user(email: str) -> User:
        user = user_repository.get_by_email(email)
        if not user:
            name = email.split("@")[0].replace(".", " ").title()
            # Check if email should be instructor
            role = "instructor" if email.lower() in AuthService.INSTRUCTOR_EMAILS else "student"
            user = user_repository.create_user(email=email, name=name, role=role)
            db.session.commit()
        else:
            # Update role if user should be instructor but isn't
            email_lower = email.lower()
            if email_lower in AuthService.INSTRUCTOR_EMAILS and user.role != "instructor":
                user.role = "instructor"
                db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return user_repository.get_by_id(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        return user_repository.get_by_email(email)

