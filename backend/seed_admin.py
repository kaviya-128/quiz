"""
Seed Admin Script
Run this script to create the default admin user.
Usage: python seed_admin.py
"""
from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Check if admin already exists
    existing_admin = User.query.filter_by(role='admin').first()

    if existing_admin:
        print(f"⚠️  Admin user already exists: {existing_admin.username} ({existing_admin.email})")
    else:
        admin = User(
            username='admin',
            email='admin@quizapp.com',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()

        print("✅ Admin user created successfully!")
        print("=" * 40)
        print(f"   Username: admin")
        print(f"   Email:    admin@quizapp.com")
        print(f"   Password: admin123")
        print(f"   Role:     admin")
        print("=" * 40)
