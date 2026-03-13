import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    CORS(app,
         resources={r"/api/*": {"origins": "*"}},
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )
    JWTManager(app)
    db.init_app(app)

    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.user import user_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(user_bp, url_prefix="/api/user")

    with app.app_context():
        db.create_all()

    # TEMPORARY - remove after seeding!
    @app.route("/api/seed-admin")
    def seed_admin():
        from models import User
        from werkzeug.security import generate_password_hash
        if User.query.filter_by(email="admin@quizapp.com").first():
            return jsonify({"message": "Admin already exists!"})
        admin = User(
            username="admin",
            email="admin@quizapp.com",
            password_hash=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        return jsonify({"message": "Admin created!"})

    return app


if __name__ == "__main__":
    app = create_app()
    print("🚀 Quiz App Backend running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)