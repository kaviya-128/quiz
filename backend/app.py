import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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

    return app


if __name__ == "__main__":
    app = create_app()
    print("🚀 Quiz App Backend running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)