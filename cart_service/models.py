from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Cart(db.Model):
    __tablename__ = 'carts'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(36), nullable=True)
    user_id = db.Column(db.Integer, nullable=True)

    items = db.relationship('CartItem', backref='cart', cascade="all, delete-orphan")

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    track_id = db.Column(db.Integer, nullable=False)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)

    # Пользователь или гость
    user_id    = db.Column(db.Integer, nullable=True)
    session_id = db.Column(db.String(36), nullable=True)

    # Данные для отправки трека
    email   = db.Column(db.String(120), nullable=False)
    country = db.Column(db.String(50), nullable=False)
    region  = db.Column(db.String(100), nullable=False)

    # Статус и оплата
    status     = db.Column(db.String(20), nullable=False, default='pending')
    payment_id = db.Column(db.String(64), nullable=True)

    # Временные метки
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    paid_at    = db.Column(db.DateTime, nullable=True)

    # Позиции заказа
    items = db.relationship('OrderItem', backref='order', cascade='all, delete-orphan')

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)

    # Связь с заказом
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)

    # Данные по треку
    track_id = db.Column(db.Integer, nullable=False)
    price    = db.Column(db.Float, nullable=False)
