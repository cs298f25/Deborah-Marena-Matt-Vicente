from __future__ import annotations

from flask import Blueprint, jsonify, request, session

from backend.models import User
from backend.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    """Authenticate or auto-register a user based on email."""

    payload = request.get_json(silent=True) or {}
    email = payload.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = AuthService.login_or_create_user(email)
    session["user_id"] = user.id
    return jsonify({"user": _serialise_user(user)})


@auth_bp.get("/profile")
def profile():
    """Return the current authenticated user's profile."""

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    user = AuthService.get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(_serialise_user(user))


def _serialise_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }

