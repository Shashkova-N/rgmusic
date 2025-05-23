import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URI',
        'postgresql://myuser:mypassword@db:5432/user_service_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'my-super-secret-key-1234567890abcdef')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
