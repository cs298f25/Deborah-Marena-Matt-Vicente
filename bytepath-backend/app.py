from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import csv
import os
from io import StringIO, BytesIO
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production

db = SQLAlchemy(app)
CORS(app)  # Enable CORS for API access


# Student Model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Student {self.first_name} {self.last_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# Create database tables with the new schema
with app.app_context():
    # This will create the database with the current model definitions
    db.create_all()
    print("✅ Database tables created with current schema")


@app.route('/')
def index():
    students = Student.query.all()
    return render_template('index.html', students=students)


@app.route('/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        flash('No file selected', 'error')
        return redirect(url_for('index'))

    file = request.files['file']

    if file.filename == '':
        flash('No file selected', 'error')
        return redirect(url_for('index'))

    if not file.filename.endswith('.csv'):
        flash('Please upload a CSV file', 'error')
        return redirect(url_for('index'))

    try:
        # Read CSV file
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)

        added_count = 0
        skipped_count = 0

        for row in csv_reader:
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            email = row.get('email', '').strip()

            if not first_name or not last_name or not email:
                skipped_count += 1
                continue

            # Check if student already exists
            existing_student = Student.query.filter_by(email=email).first()

            if existing_student:
                skipped_count += 1
                continue

            # Add new student
            new_student = Student(first_name=first_name, last_name=last_name, email=email)
            db.session.add(new_student)
            added_count += 1

        db.session.commit()
        flash(f'Successfully added {added_count} students. Skipped {skipped_count} duplicates/invalid entries.', 'success')

    except Exception as e:
        db.session.rollback()
        flash(f'Error processing file: {str(e)}', 'error')

    return redirect(url_for('index'))


@app.route('/clear', methods=['POST'])
def clear_students():
    try:
        Student.query.delete()
        db.session.commit()
        flash('All students cleared from database', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error clearing database: {str(e)}', 'error')

    return redirect(url_for('index'))


# ============ REST API ENDPOINTS ============

@app.route('/api/students', methods=['GET'])
def api_get_students():
    """Get paginated list of students with optional search"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 20, type=int)
    search = request.args.get('search', '', type=str)
    
    # Build query
    query = Student.query
    
    # Apply search filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            db.or_(
                Student.first_name.ilike(search_filter),
                Student.last_name.ilike(search_filter),
                Student.email.ilike(search_filter)
            )
        )
    
    # Get paginated results
    pagination = query.order_by(Student.created_at.desc()).paginate(
        page=page, per_page=page_size, error_out=False
    )
    
    return jsonify({
        'items': [student.to_dict() for student in pagination.items],
        'page': page,
        'page_size': page_size,
        'total': pagination.total,
        'total_pages': pagination.pages
    })


@app.route('/api/students/upload', methods=['POST'])
def api_upload_students():
    """Upload CSV file with students"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        inserted = 0
        updated = 0
        skipped = 0
        errors = []
        line_num = 1  # Header is line 0
        
        for row in csv_reader:
            line_num += 1
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            email = row.get('email', '').strip()
            
            # Validate required fields
            if not first_name:
                errors.append({'line': line_num, 'reason': 'Missing first_name'})
                continue
            if not last_name:
                errors.append({'line': line_num, 'reason': 'Missing last_name'})
                continue
            if not email:
                errors.append({'line': line_num, 'reason': 'Missing email'})
                continue
            
            # Check if student exists
            existing = Student.query.filter_by(email=email).first()
            
            if existing:
                # Update existing student
                existing.first_name = first_name
                existing.last_name = last_name
                existing.updated_at = datetime.utcnow()
                updated += 1
            else:
                # Insert new student
                new_student = Student(
                    first_name=first_name,
                    last_name=last_name,
                    email=email
                )
                db.session.add(new_student)
                inserted += 1
        
        db.session.commit()
        
        return jsonify({
            'summary': {
                'inserted': inserted,
                'updated': updated,
                'skipped': skipped,
                'total_processed': line_num - 1
            },
            'errors': errors
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/students/template', methods=['GET'])
def api_download_template():
    """Download CSV template"""
    csv_content = "first_name,last_name,email\nJohn,Doe,john.doe@example.com\nJane,Smith,jane.smith@example.com\n"
    
    buffer = BytesIO()
    buffer.write(csv_content.encode('utf-8'))
    buffer.seek(0)
    
    return send_file(
        buffer,
        mimetype='text/csv',
        as_attachment=True,
        download_name='students_template.csv'
    )


if __name__ == '__main__':
    app.run(debug=True, port=5001)
