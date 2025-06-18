import logging
from flask import Flask
from flask_cors import CORS
from models import db, Cart, CartItem
from flask_migrate import Migrate
from routes.cart_routes import cart_bp
from routes.payment_routes import payment_bp
import os
from yookassa import Configuration

Configuration.account_id = os.getenv("YOOKASSA_SHOP_ID")
Configuration.secret_key = os.getenv("YOOKASSA_SECRET_KEY")

def create_app():
    app = Flask(__name__)
    app.debug = True                           # включить debug-режим
    app.logger.setLevel(logging.DEBUG)
    app.config['SQLALCHEMY_DATABASE_URI'] = \
        'postgresql://myuser:mypassword@cart_db:5432/cart_service_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # CORS с поддержкой preflight и нужными заголовками
    CORS(app,
         resources={
             r"/cart/*": {"origins": "http://localhost:3000"}, 
             r"/payment/*": {"origins": "http://localhost:3000"},},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-User-ID"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # инициализируем расширения
    db.init_app(app)
    Migrate(app, db)

    # регистрируем blueprint
    app.register_blueprint(cart_bp)
    app.register_blueprint(payment_bp)

    return app

if __name__ == '__main__':
    create_app().run(host='0.0.0.0', port=5002)
