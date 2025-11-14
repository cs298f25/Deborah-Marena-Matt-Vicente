"""
Comprehensive tests for the Bytepath Flask application.
Tests follow the patterns demonstrated in test_todo_app.py and test_todo_list.py
"""
import pytest
from io import BytesIO
from flask import Flask
from database import db
from models import Student
from app import app as flask_app, normalize_student_fields


# ============ FIXTURES ============

@pytest.fixture
def app():
    """Create and configure a test Flask application instance."""
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use in-memory database for testing
    flask_app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for testing
    
    # Create tables
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask application."""
    return app.test_client()


@pytest.fixture
def sample_student(app):
    """Create a sample student in the database."""
    with app.app_context():
        student = Student(
            first_name='John',
            last_name='Doe',
            email='jdoe@moravian.edu'
        )
        db.session.add(student)
        db.session.commit()
        return student


# ============ HELPER FUNCTION TESTS ============

def test_normalize_student_fields_with_separate_fields():
    """Test normalize_student_fields with first_name, last_name, email fields."""
    row = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'jdoe@moravian.edu'
    }
    first_name, last_name, email = normalize_student_fields(row)
    
    assert first_name == 'John'
    assert last_name == 'Doe'
    assert email == 'jdoe@moravian.edu'


def test_normalize_student_fields_with_name_field():
    """Test normalize_student_fields when 'name' field contains full name."""
    row = {
        'name': 'Jane Smith',
        'email': 'jsmith@moravian.edu'
    }
    first_name, last_name, email = normalize_student_fields(row)
    
    assert first_name == 'Jane'
    assert last_name == 'Smith'
    assert email == 'jsmith@moravian.edu'


def test_normalize_student_fields_with_spaces():
    """Test normalize_student_fields handles extra spaces."""
    row = {
        'first_name': '  John  ',
        'last_name': '  Doe  ',
        'email': '  jdoe@moravian.edu  '
    }
    first_name, last_name, email = normalize_student_fields(row)
    
    assert first_name == 'John'
    assert last_name == 'Doe'
    assert email == 'jdoe@moravian.edu'


def test_normalize_student_fields_with_missing_values():
    """Test normalize_student_fields with missing values."""
    row = {
        'first_name': '',
        'last_name': '',
        'email': ''
    }
    first_name, last_name, email = normalize_student_fields(row)
    
    assert first_name == ''
    assert last_name == ''
    assert email == ''


# ============ ROUTE TESTS ============

def test_index_route(client):
    """Test the landing page route returns 200."""
    response = client.get('/')
    assert response.status_code == 200


def test_professor_portal_route(client):
    """Test the professor portal route returns 200."""
    response = client.get('/professor')
    assert response.status_code == 200


def test_professor_portal_displays_students(client, app):
    """Test professor portal displays students from database."""
    # Add test students
    with app.app_context():
        student1 = Student(first_name='Alice', last_name='Johnson', email='ajohnson@moravian.edu')
        student2 = Student(first_name='Bob', last_name='Williams', email='bwilliams@moravian.edu')
        db.session.add(student1)
        db.session.add(student2)
        db.session.commit()
    
    response = client.get('/professor')
    assert response.status_code == 200
    # Check if student names appear in response (as HTML)
    assert b'Alice' in response.data or b'ajohnson@moravian.edu' in response.data


def test_student_access_get(client):
    """Test student access page GET request."""
    response = client.get('/student')
    assert response.status_code == 200


def test_student_access_post_empty_email(client):
    """Test student access POST with empty email shows error."""
    response = client.post('/student', data={'email': ''}, follow_redirects=True)
    assert response.status_code == 200
    assert b'Please enter your Moravian email' in response.data


def test_student_access_post_nonexistent_email(client):
    """Test student access POST with email not in database shows error."""
    response = client.post('/student', data={'email': 'notfound@moravian.edu'}, follow_redirects=False)
    assert response.status_code == 200
    assert b'Email not found' in response.data


def test_student_access_post_valid_email(client, app):
    """Test student access POST with valid email redirects to Bytepath."""
    # Add student to database
    with app.app_context():
        student = Student(first_name='Test', last_name='Student', email='tstudent@moravian.edu')
        db.session.add(student)
        db.session.commit()
    
    response = client.post('/student', data={'email': 'tstudent@moravian.edu'}, follow_redirects=False)
    assert response.status_code == 302  # Redirect status
    assert 'email=tstudent%40moravian.edu' in response.location


def test_student_access_case_insensitive(client, app):
    """Test student access is case-insensitive for email."""
    with app.app_context():
        student = Student(first_name='Test', last_name='Student', email='TStudent@moravian.edu')
        db.session.add(student)
        db.session.commit()
    
    # Test with lowercase email
    response = client.post('/student', data={'email': 'tstudent@moravian.edu'}, follow_redirects=False)
    assert response.status_code == 302


# ============ CSV UPLOAD TESTS ============

def test_upload_csv_no_file(client):
    """Test CSV upload with no file returns error."""
    response = client.post('/upload', data={}, follow_redirects=True)
    assert response.status_code == 200
    assert b'No file selected' in response.data


def test_upload_csv_empty_filename(client):
    """Test CSV upload with empty filename returns error."""
    data = {'file': (BytesIO(b''), '')}
    response = client.post('/upload', data=data, follow_redirects=True)
    assert response.status_code == 200
    assert b'No file selected' in response.data


def test_upload_csv_wrong_extension(client):
    """Test CSV upload with non-CSV file returns error."""
    data = {'file': (BytesIO(b'test data'), 'test.txt')}
    response = client.post('/upload', data=data, follow_redirects=True)
    assert response.status_code == 200
    assert b'Please upload a CSV file' in response.data


def test_upload_csv_valid_file(client, app):
    """Test CSV upload with valid file adds students."""
    csv_content = b'first_name,last_name,email\nAlice,Smith,asmith@moravian.edu\nBob,Jones,bjones@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)
    assert response.status_code == 200
    assert b'Successfully added 2 students' in response.data
    
    # Verify students are in database
    with app.app_context():
        assert Student.query.count() == 2
        alice = Student.query.filter_by(email='asmith@moravian.edu').first()
        assert alice is not None
        assert alice.first_name == 'Alice'


def test_upload_csv_with_duplicates(client, app):
    """Test CSV upload skips duplicate emails."""
    # Add existing student
    with app.app_context():
        existing = Student(first_name='Alice', last_name='Smith', email='asmith@moravian.edu')
        db.session.add(existing)
        db.session.commit()
    
    csv_content = b'first_name,last_name,email\nAlice,Smith,asmith@moravian.edu\nBob,Jones,bjones@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)
    assert response.status_code == 200
    assert b'Successfully added 1 students' in response.data
    assert b'Skipped 1' in response.data


def test_upload_csv_with_name_field(client, app):
    """Test CSV upload handles 'name' field correctly."""
    csv_content = b'name,email\nAlice Smith,asmith@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)
    assert response.status_code == 200
    
    with app.app_context():
        alice = Student.query.filter_by(email='asmith@moravian.edu').first()
        assert alice is not None
        assert alice.first_name == 'Alice'
        assert alice.last_name == 'Smith'


def test_upload_csv_skips_invalid_rows(client, app):
    """Test CSV upload skips rows with missing required fields."""
    csv_content = b'first_name,last_name,email\nAlice,,asmith@moravian.edu\n,Jones,bjones@moravian.edu\nCarol,Williams,cwilliams@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/upload', data=data, content_type='multipart/form-data', follow_redirects=True)
    assert response.status_code == 200
    assert b'Successfully added 1 students' in response.data
    assert b'Skipped 2' in response.data


# ============ CLEAR STUDENTS TESTS ============

def test_clear_students_empty_database(client, app):
    """Test clearing students when database is empty."""
    response = client.post('/clear', follow_redirects=True)
    assert response.status_code == 200
    assert b'All students cleared from database' in response.data
    
    with app.app_context():
        assert Student.query.count() == 0


def test_clear_students_with_data(client, app):
    """Test clearing students removes all students from database."""
    # Add test students
    with app.app_context():
        student1 = Student(first_name='Alice', last_name='Johnson', email='ajohnson@moravian.edu')
        student2 = Student(first_name='Bob', last_name='Williams', email='bwilliams@moravian.edu')
        db.session.add(student1)
        db.session.add(student2)
        db.session.commit()
        assert Student.query.count() == 2
    
    response = client.post('/clear', follow_redirects=True)
    assert response.status_code == 200
    assert b'All students cleared from database' in response.data
    
    with app.app_context():
        assert Student.query.count() == 0


# ============ API ENDPOINT TESTS ============

def test_api_get_students_empty(client):
    """Test API endpoint returns empty list when no students."""
    response = client.get('/api/students')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert json_data['items'] == []
    assert json_data['total'] == 0
    assert json_data['page'] == 1


def test_api_get_students_with_data(client, app):
    """Test API endpoint returns students."""
    with app.app_context():
        student1 = Student(first_name='Alice', last_name='Johnson', email='ajohnson@moravian.edu')
        student2 = Student(first_name='Bob', last_name='Williams', email='bwilliams@moravian.edu')
        db.session.add(student1)
        db.session.add(student2)
        db.session.commit()
    
    response = client.get('/api/students')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert len(json_data['items']) == 2
    assert json_data['total'] == 2


def test_api_get_students_with_search(client, app):
    """Test API endpoint filters students by search query."""
    with app.app_context():
        student1 = Student(first_name='Alice', last_name='Johnson', email='ajohnson@moravian.edu')
        student2 = Student(first_name='Bob', last_name='Williams', email='bwilliams@moravian.edu')
        db.session.add(student1)
        db.session.add(student2)
        db.session.commit()
    
    response = client.get('/api/students?search=Alice')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert len(json_data['items']) == 1
    assert json_data['items'][0]['first_name'] == 'Alice'


def test_api_get_students_pagination(client, app):
    """Test API endpoint pagination works correctly."""
    # Add multiple students
    with app.app_context():
        for i in range(25):
            student = Student(
                first_name=f'Student{i}',
                last_name=f'Test{i}',
                email=f'student{i}@moravian.edu'
            )
            db.session.add(student)
        db.session.commit()
    
    # Get first page
    response = client.get('/api/students?page=1&page_size=10')
    json_data = response.get_json()
    assert len(json_data['items']) == 10
    assert json_data['page'] == 1
    assert json_data['total'] == 25
    assert json_data['total_pages'] == 3


def test_api_upload_students_no_file(client):
    """Test API upload endpoint with no file returns 400."""
    response = client.post('/api/students/upload')
    assert response.status_code == 400
    assert response.get_json()['error'] == 'No file provided'


def test_api_upload_students_valid(client, app):
    """Test API upload endpoint with valid CSV file."""
    csv_content = b'first_name,last_name,email\nAlice,Smith,asmith@moravian.edu\nBob,Jones,bjones@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/api/students/upload', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert json_data['summary']['inserted'] == 2
    assert json_data['summary']['updated'] == 0
    assert len(json_data['errors']) == 0


def test_api_upload_students_updates_existing(client, app):
    """Test API upload updates existing students."""
    # Add existing student
    with app.app_context():
        existing = Student(first_name='Alice', last_name='OldName', email='asmith@moravian.edu')
        db.session.add(existing)
        db.session.commit()
    
    csv_content = b'first_name,last_name,email\nAlice,NewName,asmith@moravian.edu'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/api/students/upload', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert json_data['summary']['inserted'] == 0
    assert json_data['summary']['updated'] == 1
    
    # Verify update
    with app.app_context():
        alice = Student.query.filter_by(email='asmith@moravian.edu').first()
        assert alice.last_name == 'NewName'


def test_api_upload_students_with_errors(client):
    """Test API upload reports errors for invalid rows."""
    csv_content = b'first_name,last_name,email\n,Smith,asmith@moravian.edu\nBob,,bjones@moravian.edu\nCarol,Williams,'
    data = {'file': (BytesIO(csv_content), 'students.csv')}
    
    response = client.post('/api/students/upload', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert json_data['summary']['inserted'] == 0
    assert len(json_data['errors']) == 3


def test_api_download_template(client):
    """Test API template download endpoint."""
    response = client.get('/api/students/template')
    assert response.status_code == 200
    assert response.mimetype == 'text/csv'
    assert b'first_name,last_name,email' in response.data
    assert b'John,Doe,john.doe@example.com' in response.data