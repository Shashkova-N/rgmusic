from extensions import db

class Cart(db.Model):
    __tablename__ = 'carts'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(36), nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    track_ids = db.Column(db.String(500), nullable=False)
