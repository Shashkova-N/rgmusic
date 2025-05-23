from datetime import datetime
from . import db

class Track(db.Model):
    __tablename__ = 'tracks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    tempo = db.Column(db.Enum('Быстро', 'Умеренно', 'Медленно', name='tempo_enum'), nullable=False)
    voice = db.Column(db.Enum('Есть', 'Нет', 'Вокализ', name='voice_enum'), nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # длительность без сигнала
    language = db.Column(db.String(50))
    composer = db.Column(db.String(100))
    poet = db.Column(db.String(100))
    studio = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    vk_number = db.Column(db.String(50))
    file_clean = db.Column(db.String(200), nullable=False)
    file_watermarked = db.Column(db.String(200), nullable=False)
    is_visible = db.Column(db.Boolean, default=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
