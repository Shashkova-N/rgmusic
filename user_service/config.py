import os

class Config:
    # POSTGRES_USER=myuser
    # POSTGRES_PASSWORD=mypassword
    # POSTGRES_HOST=db
    # POSTGRES_PORT=5432
    # POSTGRES_DB=user_service_db
    # POSTGRES_TRACK_DB=track_service_db
    # POSTGRES_CART_DB=cart_service_db

    # SQLALCHEMY_DATABASE_URI = os.getenv(
    #     'DATABASE_URI',
    #     'postgresql://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT/POSTGRES_DB'
    # )
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}"
        f"@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/"
        f"{os.getenv('POSTGRES_DB')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'my-super-secret-key-1234567890abcdef')
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
