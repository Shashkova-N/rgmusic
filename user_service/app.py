from flask import Flask
from flask_cors import CORS
from config import Config
from models import db, User
from auth import init_extensions, jwt  # импортируем сам JWTManager
from routes_user import user_bp
from routes_purchase import pur_bp
from routes_admin import admin_bp
from flask_migrate import Migrate


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Настройка CORS: разрешаем необходимые заголовки (включая X-User-ID для межсервисных запросов)
    CORS(
        app,
        resources={r"/*": {"origins": Config.FRONTEND_URL}},
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-User-ID",
            "X-CSRF-Token"
        ],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Инициализация БД и миграций
    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        db.create_all()

    # Инициализация JWT и bcrypt
    init_extensions(app)

    # Настраиваем загрузку текущего пользователя из JWT
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.query.get(int(identity))

    # Регистрируем маршруты
    app.register_blueprint(user_bp)
    app.register_blueprint(pur_bp)
    app.register_blueprint(admin_bp)

    return app


if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5000)
