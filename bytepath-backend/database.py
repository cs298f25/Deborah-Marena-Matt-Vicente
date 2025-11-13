from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy instance is created here and initialized in app.py
db = SQLAlchemy()


def init_db(app):
    """Initialize extensions and ensure tables exist."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
