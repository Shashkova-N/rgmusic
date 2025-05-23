from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from models import db
from models import Track, Playlist, playlist_track
from routes.track_routes import track_bp
from routes.playlist_routes import playlist_bp

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@track_db:5432/track_service_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        db.create_all()

    app.register_blueprint(track_bp)
    app.register_blueprint(playlist_bp)

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5001)
