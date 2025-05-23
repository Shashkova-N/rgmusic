from flask import Flask
from flask_cors import CORS
from extensions import db, migrate
from routes.cart_routes import cart_bp

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = \
      'postgresql://myuser:mypassword@cart_db:5432/cart_service_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    # инициализируем расширения
    db.init_app(app)
    migrate.init_app(app, db)

    # регистрируем blueprint
    app.register_blueprint(cart_bp)

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
