# auth.py
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token

bcrypt = Bcrypt()
jwt = JWTManager()

def create_jwt(user_id, role):
    # identity сохраняем как строку, role — в additional_claims
    return create_access_token(
        identity=str(user_id),
        additional_claims={'role': role}
    )

def init_extensions(app):
    bcrypt.init_app(app)
    jwt.init_app(app)
