"""
Simple script to add new columns to existing roster_students table.
Run this once to update your database schema.
"""

from backend.app import create_app
from backend.models import db

app = create_app()

with app.app_context():
    # Check if columns exist and add them if they don't
    inspector = db.inspect(db.engine)
    columns = [col['name'] for col in inspector.get_columns('roster_students')]
    
    print(f"Existing columns: {columns}")
    
    # Add missing columns
    with db.engine.connect() as conn:
        if 'deleted_at' not in columns:
            print("Adding deleted_at column...")
            conn.execute(db.text("ALTER TABLE roster_students ADD COLUMN deleted_at DATETIME"))
            conn.commit()
        
        if 'notes' not in columns:
            print("Adding notes column...")
            conn.execute(db.text("ALTER TABLE roster_students ADD COLUMN notes TEXT"))
            conn.commit()
        
        if 'class_name' not in columns:
            print("Adding class_name column...")
            conn.execute(db.text("ALTER TABLE roster_students ADD COLUMN class_name VARCHAR(100)"))
            conn.commit()
        
        if 'last_updated_via' not in columns:
            print("Adding last_updated_via column...")
            conn.execute(db.text("ALTER TABLE roster_students ADD COLUMN last_updated_via VARCHAR(20)"))
            conn.commit()
        
        if 'last_upload_id' not in columns:
            print("Adding last_upload_id column...")
            conn.execute(db.text("ALTER TABLE roster_students ADD COLUMN last_upload_id INTEGER"))
            conn.commit()
    
    # Create upload_history table if it doesn't exist
    db.create_all()
    
    print("Database schema updated successfully!")

