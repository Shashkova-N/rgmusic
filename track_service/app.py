from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

from models import db
from models import Track, Playlist, playlist_track
from routes.track_routes import track_bp
from routes.playlist_routes import playlist_bp

def create_app():
    app = Flask(__name__)


        # Конфигурация базы данных
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
        f"@{os.getenv('POSTGRES_HOST_TRACK')}:{os.getenv('POSTGRES_PORT')}/"
        f"{os.getenv('POSTGRES_TRACK_DB')}"
    )
    #os.getenv(
        # 'TRACK_DATABASE_URI',
        
        # 'postgresql://myuser:mypassword@cart_db:5432/cart_service_db'
    #)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


    #app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@track_db:5432/track_service_db'
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    CORS(app, resources={r"/*": {"origins": frontend_url}})

    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        db.create_all()

    app.register_blueprint(track_bp)
    app.register_blueprint(playlist_bp)

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5001)
