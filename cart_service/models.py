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