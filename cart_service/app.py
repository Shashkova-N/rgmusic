import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from models import db, Cart, CartItem, Order, OrderItem
from flask_migrate import Migrate
from routes.cart_routes import cart_bp
from routes.payment_routes import payment_bp
from yookassa import Configuration

# Загрузка переменных окружения из корневого .env
dotenv_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path)

# Конфигурация Yookassa
Configuration.account_id = os.getenv("YOOKASSA_SHOP_ID")
Configuration.secret_key  = os.getenv("YOOKASSA_SECRET_KEY")


def create_app():
    app = Flask(__name__)
    app.debug = True
    app.logger.setLevel(logging.DEBUG)

    # Конфигурация базы данных
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'CART_DATABASE_URI',
        'postgresql://myuser:mypassword@cart_db:5432/cart_service_db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Конфигурация внешних сервисов
    app.config['TRACK_SERVICE_URL'] = os.getenv('TRACK_SERVICE_URL')
    app.config['FRONTEND_URL']     = os.getenv('FRONTEND_URL')

    # CORS с поддержкой preflight и нужными заголовками
    CORS(
        app,
        resources={
            r"/cart/*":    {"origins": os.getenv('FRONTEND_URL')},
            r"/payment/*": {"origins": os.getenv('FRONTEND_URL')},
        },
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-User-ID"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Инициализируем расширения
    db.init_app(app)
    Migrate(app, db)

    # Регистрируем blueprints
    app.register_blueprint(cart_bp)
    app.register_blueprint(payment_bp)

    return app


if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5002)
