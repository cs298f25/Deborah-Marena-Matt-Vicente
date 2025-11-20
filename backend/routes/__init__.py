from backend.routes.auth import auth_bp
from backend.routes.progress import progress_bp
from backend.routes.reports import reports_bp
from backend.routes.responses import responses_bp
from backend.routes.students import students_bp
from backend.routes.topics import topics_bp

__all__ = [
    "auth_bp",
    "responses_bp",
    "progress_bp",
    "topics_bp",
    "reports_bp",
    "students_bp",
]

