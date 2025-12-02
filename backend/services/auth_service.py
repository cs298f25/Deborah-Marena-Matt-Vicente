from __future__ import annotations

from typing import Optional

from sqlalchemy import func

from backend.models import RosterStudent, User, db
from backend.repositories import user_repository


class AuthService:
    """Service encapsulating authentication-related operations."""

    # List of emails that should be assigned instructor role
    INSTRUCTOR_EMAILS = {"bush@moravian.edu"}

    @staticmethod
    def login_or_create_user(email: str) -> User:
        email_lower = email.lower()

        roster_entry = (
            db.session.execute(
                db.select(RosterStudent).filter(
                    func.lower(RosterStudent.email) == email_lower,
                    RosterStudent.deleted_at.is_(None),
                )
            )
            .scalars()
            .first()
        )

        preferred_name = (
            f"{roster_entry.first_name} {roster_entry.last_name}".strip()
            if roster_entry
            else None
        )

        user = user_repository.get_by_email(email)
        desired_role = (
            "instructor" if email_lower in AuthService.INSTRUCTOR_EMAILS else "student"
        )

        if not user:
            name = preferred_name or email.split("@")[0].replace(".", " ").title()
            user = user_repository.create_user(email=email, name=name, role=desired_role)
            db.session.commit()
        else:
            if email_lower in AuthService.INSTRUCTOR_EMAILS and user.role != "instructor":
                user.role = "instructor"
            elif roster_entry and user.role != "instructor":
                # Ensure rostered logins are treated as students for reporting
                user.role = "student"

            if roster_entry and preferred_name and user.name != preferred_name:
                user.name = preferred_name

            if db.session.is_modified(user):
                db.session.commit()

        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        return user_repository.get_by_id(user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        return user_repository.get_by_email(email)
