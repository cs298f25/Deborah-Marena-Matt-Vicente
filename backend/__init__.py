"""
Backend package initializer.

In test environments we may not have optional Flask extensions installed; fall back to lightweight
stubs so importing this package does not fail.
"""

import sys
import types

# Stub flask_cors if missing
try:  # pragma: no cover - best effort for tests
    import flask_cors  # type: ignore
except ModuleNotFoundError:
    flask_cors = types.ModuleType("flask_cors")
    flask_cors.CORS = lambda *args, **kwargs: None
    sys.modules["flask_cors"] = flask_cors

# Stub flask_sqlalchemy if missing
try:  # pragma: no cover - best effort for tests
    import flask_sqlalchemy  # type: ignore
except ModuleNotFoundError:
    flask_sqlalchemy = types.ModuleType("flask_sqlalchemy")

    class _DummyColumn:
        def __init__(self, *args, **kwargs):
            pass

    class _DummyRelation:
        def __call__(self, *args, **kwargs):
            return None

    class _DummyConstraint:
        def __init__(self, *args, **kwargs):
            pass

    class SQLAlchemy:
        def __init__(self, *args, **kwargs):
            self.Model = object
            self.Column = _DummyColumn
            self.Integer = int
            self.String = str
            self.Boolean = bool
            self.DateTime = str
            self.Text = str
            self.ForeignKey = lambda *a, **kw: None
            self.relationship = _DummyRelation()
            self.UniqueConstraint = _DummyConstraint
            self.session = types.SimpleNamespace(
                commit=lambda: None, flush=lambda: None, remove=lambda: None
            )

        def init_app(self, app):
            return None

        def create_all(self):
            return None

    flask_sqlalchemy.SQLAlchemy = SQLAlchemy
    sys.modules["flask_sqlalchemy"] = flask_sqlalchemy

# Stub sqlalchemy if missing
try:  # pragma: no cover
    import sqlalchemy  # type: ignore
except ModuleNotFoundError:
    sqlalchemy = types.ModuleType("sqlalchemy")
    sqlalchemy.func = types.SimpleNamespace(lower=lambda x: x)

    def _noop(*args, **kwargs):
        return None

    sqlalchemy.and_ = _noop
    sqlalchemy.desc = _noop
    sqlalchemy.case = _noop
    sqlalchemy.or_ = _noop
    exc_module = types.ModuleType("sqlalchemy.exc")
    exc_module.SQLAlchemyError = Exception
    sqlalchemy.exc = exc_module
    sys.modules["sqlalchemy"] = sqlalchemy
    sys.modules["sqlalchemy.exc"] = exc_module

from backend.app import create_app  # noqa: E402,F401
