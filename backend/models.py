"""
SQLAlchemy Models for BytePath

These models match the database schema.
"""

from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student' or 'instructor'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    responses = db.relationship("StudentResponse", backref="user", lazy=True)
    progress = db.relationship("StudentProgress", backref="user", lazy=True)

    def __repr__(self) -> str:
        return f"<User {self.email}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


class Topic(db.Model):
    __tablename__ = "topics"

    id = db.Column(db.String(100), primary_key=True)  # e.g., 'tuples'
    name = db.Column(db.String(100), nullable=False)
    is_visible = db.Column(db.Boolean, default=True)
    order_index = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    responses = db.relationship("StudentResponse", backref="topic_ref", lazy=True)
    progress = db.relationship("StudentProgress", backref="topic_ref", lazy=True)

    def __repr__(self) -> str:
        return f"<Topic {self.name}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "is_visible": self.is_visible,
            "order_index": self.order_index,
        }


class StudentResponse(db.Model):
    __tablename__ = "student_responses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic = db.Column(db.String(100), db.ForeignKey("topics.id"), nullable=False)
    subtopic_type = db.Column(
        db.String(100), nullable=False
    )  # e.g., 'TupleOfIntLength'
    question_code = db.Column(db.Text, nullable=False)
    student_answer = db.Column(db.Text)
    correct_answer = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    status = db.Column(db.String(20))  # 'correct', 'incorrect', 'skipped'
    time_spent = db.Column(db.Integer)  # seconds
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<Response user={self.user_id} topic={self.topic}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "subtopic_type": self.subtopic_type,
            "question_code": self.question_code,
            "student_answer": self.student_answer,
            "correct_answer": self.correct_answer,
            "is_correct": self.is_correct,
            "status": self.status,
            "time_spent": self.time_spent,
            "attempted_at": self.attempted_at.isoformat(),
        }


class StudentProgress(db.Model):
    __tablename__ = "student_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    topic = db.Column(db.String(100), db.ForeignKey("topics.id"), nullable=False)
    subtopics_completed = db.Column(db.Integer, default=0)
    total_subtopics = db.Column(db.Integer)
    questions_answered = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)

    # Ensure one progress record per user per topic
    __table_args__ = (db.UniqueConstraint("user_id", "topic", name="_user_topic_uc"),)

    def __repr__(self) -> str:
        return f"<Progress user={self.user_id} topic={self.topic}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "topic": self.topic,
            "subtopics_completed": self.subtopics_completed,
            "total_subtopics": self.total_subtopics,
            "questions_answered": self.questions_answered,
            "completion_percentage": (
                self.subtopics_completed / self.total_subtopics * 100
                if self.total_subtopics
                else 0
            ),
            "last_accessed": self.last_accessed.isoformat(),
        }


class RosterStudent(db.Model):
    """
    Lightweight roster table used for CSV uploads and instructor roster views.

    This lives alongside the `users` table so that instructors can import
    prospective students (or demo rosters) without impacting auth records.
    """

    __tablename__ = "roster_students"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    first_name = db.Column(db.String(120), nullable=False)
    last_name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<RosterStudent {self.email}>"

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

