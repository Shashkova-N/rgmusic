from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')  # <-- новое поле роли
    country = db.Column(db.String(50), nullable=False)
    region = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    region = db.Column(db.String(100), nullable=False)
    purchase_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    track_id = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
