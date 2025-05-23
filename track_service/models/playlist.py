from . import db
from .association import playlist_track

class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(200))

    tracks = db.relationship(
        'Track',
        secondary=playlist_track,
        backref='playlists'
    )
