from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
import csv
import os
from io import StringIO

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///students.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this in production

db = SQLAlchemy(app)


# Student Model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<Student {self.name}>'


# Create database tables
with app.app_context():
    db.create_all()


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
            name = row.get('name', '').strip()
            email = row.get('email', '').strip()

            if not name or not email:
                skipped_count += 1
                continue

            # Check if student already exists
            existing_student = Student.query.filter_by(email=email).first()

            if existing_student:
                skipped_count += 1
                continue

            # Add new student
            new_student = Student(name=name, email=email)
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


if __name__ == '__main__':
    app.run(debug=True)
