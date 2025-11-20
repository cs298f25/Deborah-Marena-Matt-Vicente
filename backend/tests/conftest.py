import pytest

from backend.app import create_app
from backend.models import db, StudentProgress, StudentResponse, Topic, User


@pytest.fixture
def app():
    """Create a Flask application instance for testing."""

    app = create_app("testing")
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SERVER_NAME"] = "localhost"

    with app.app_context():
        db.create_all()
        seed_test_data()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Return a Flask test client."""

    return app.test_client()


@pytest.fixture
def runner(app):
    """Return a Flask CLI runner."""

    return app.test_cli_runner()


@pytest.fixture
def instructor_id(app):
    with app.app_context():
        return db.session.execute(
            db.select(User.id).filter_by(email="instructor@test.com")
        ).scalar_one()


@pytest.fixture
def student1_id(app):
    with app.app_context():
        return db.session.execute(
            db.select(User.id).filter_by(email="student1@test.com")
        ).scalar_one()


@pytest.fixture
def student2_id(app):
    with app.app_context():
        return db.session.execute(
            db.select(User.id).filter_by(email="student2@test.com")
        ).scalar_one()


def seed_test_data():
    """Seed the in-memory database with sample data."""

    instructor = User(
        email="instructor@test.com",
        name="Test Instructor",
        role="instructor",
    )
    student1 = User(
        email="student1@test.com",
        name="Test Student 1",
        role="student",
    )
    student2 = User(
        email="student2@test.com",
        name="Test Student 2",
        role="student",
    )
    db.session.add_all([instructor, student1, student2])
    db.session.flush()

    topic1 = Topic(
        id="test-topic-1",
        name="Test Topic 1",
        is_visible=True,
        order_index=1,
    )
    topic2 = Topic(
        id="test-topic-2",
        name="Test Topic 2",
        is_visible=False,
        order_index=2,
    )
    db.session.add_all([topic1, topic2])
    db.session.flush()

    response1 = StudentResponse(
        user_id=student1.id,
        topic="test-topic-1",
        subtopic_type="TestSubtopic",
        question_code="x = 5\nx",
        student_answer="5",
        correct_answer="5",
        is_correct=True,
        status="correct",
        time_spent=30,
    )
    db.session.add(response1)

    progress1 = StudentProgress(
        user_id=student1.id,
        topic="test-topic-1",
        subtopics_completed=3,
        total_subtopics=7,
        questions_answered=10,
    )
    db.session.add(progress1)
    db.session.commit()

