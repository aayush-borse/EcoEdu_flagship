from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecoedu.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'supersecretkey'

    CORS(app)
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)

    # Import and register blueprints
    from .routes.auth import auth_bp
    from .routes.posts import posts_bp
    from .routes.reels import reels_bp
    from .routes.quiz import quiz_bp
    from .routes.leaderboard import leaderboard_bp
    from .routes.profile import profile_bp
    from .routes.hunt import hunt_bp


    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(posts_bp, url_prefix='/posts')
    app.register_blueprint(reels_bp, url_prefix='/reels')
    app.register_blueprint(quiz_bp, url_prefix='/quiz')
    app.register_blueprint(leaderboard_bp, url_prefix='/leaderboard')
    app.register_blueprint(profile_bp, url_prefix='/profile')
    app.register_blueprint(hunt_bp, url_prefix="/hunt")

    with app.app_context():
        db.create_all()
        print("Registered routes:", app.url_map)

    return app
