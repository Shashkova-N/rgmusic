import logging
import os
from pathlib import Path
from flask import Flask
from flask_cors import CORS
from models import db, Cart, CartItem, Order, OrderItem
from flask_migrate import Migrate
from routes.cart_routes import cart_bp
from routes.payment_routes import payment_bp
from yookassa import Configuration

# Конфигурация Yookassa
Configuration.account_id = os.getenv("YOOKASSA_SHOP_ID")
Configuration.secret_key  = os.getenv("YOOKASSA_SECRET_KEY")


def create_app():
    app = Flask(__name__)
    app.debug = True
    app.logger.setLevel(logging.DEBUG)

    # POSTGRES_USER=myuser
    # POSTGRES_PASSWORD=mypassword
    # POSTGRES_HOST=db
    # POSTGRES_PORT=5432
    # POSTGRES_DB=user_service_db
    # POSTGRES_TRACK_DB=track_service_db
    # POSTGRES_CART_DB=cart_service_db

    # Конфигурация базы данных
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
        f"@{os.getenv('POSTGRES_HOST_CART')}:{os.getenv('POSTGRES_PORT')}/"
        f"{os.getenv('POSTGRES_CART_DB')}"
    )
       #os.getenv(
        # 'CART_DATABASE_URI', # 'postgresql://myuser:mypassword@cart_db:5432/cart_service_db'
    #)
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    # Конфигурация внешних сервисов
    app.config['TRACK_SERVICE_URL'] = os.getenv('TRACK_SERVICE_URL')
    app.config['FRONTEND_URL'] = frontend_url

    # CORS с поддержкой preflight и нужными заголовками
    CORS(
        app,
        resources={
            r"/cart/*":    {"origins": frontend_url},
            r"/payment/*": {"origins": frontend_url},
        },
        # resources={r"/*": {"origins": [frontend_url]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-User-ID"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Инициализируем расширения
    db.init_app(app)
    Migrate(app, db)

    with app.app_context():
        db.create_all()

    # Регистрируем blueprints
    app.register_blueprint(cart_bp)
    app.register_blueprint(payment_bp)

    return app


if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5002)
