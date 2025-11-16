from __future__ import annotations

import logging
from http import HTTPStatus

from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import get_config
from backend.models import db
from backend.routes import (
    auth_bp,
    progress_bp,
    reports_bp,
    responses_bp,
    students_bp,
    topics_bp,
)


def create_app(config_name: str | None = None) -> Flask:
    """
    Application factory for the BytePath backend.

    Initializes Flask extensions, applies configuration, registers routes,
    and sets up error handlers.
    """

    app = Flask(__name__)
    config_class = get_config(config_name)
    app.config.from_object(config_class)

    _configure_extensions(app)
    _register_routes(app)
    _register_error_handlers(app)

    return app


def _configure_extensions(app: Flask) -> None:
    """Configure database, CORS, and any other Flask extensions."""

    db.init_app(app)

    with app.app_context():
        db.create_all()

    origins = app.config.get("CORS_ORIGINS", ["http://localhost:5173"])
    CORS(
        app,
        origins=origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )


def _register_routes(app: Flask) -> None:
    """Register core routes for health checks and diagnostics."""

    app.register_blueprint(auth_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(responses_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(topics_bp)

    @app.get("/health")
    def health_check():
        """Return a simple health check response."""

        return jsonify({"status": "ok"}), HTTPStatus.OK


def _register_error_handlers(app: Flask) -> None:
    """Add generic error handlers to return JSON payloads."""

    @app.errorhandler(HTTPStatus.NOT_FOUND)
    def handle_not_found(error):  # type: ignore[override]
        return (
            jsonify({"error": "Not Found", "message": str(error)}),
            HTTPStatus.NOT_FOUND,
        )

    @app.errorhandler(HTTPStatus.INTERNAL_SERVER_ERROR)
    def handle_server_error(error):  # type: ignore[override]
        logging.exception("Unhandled exception: %s", error)
        return (
            jsonify(
                {
                    "error": "Internal Server Error",
                    "message": "An unexpected error occurred.",
                }
            ),
            HTTPStatus.INTERNAL_SERVER_ERROR,
        )


if __name__ == "__main__":
    application = create_app()
    application.run(host="0.0.0.0", port=5000)
