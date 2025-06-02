from . import db
from .association import playlist_track

class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cover_image = db.Column(db.String(200))
    is_visible = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())
    views = db.Column(db.Integer, default=0)
    manual_order = db.Column(db.Integer, default=0)

    tracks = db.relationship(
        'Track',
        secondary=playlist_track,
        backref='playlists'
    )
