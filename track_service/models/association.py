from . import db

playlist_track = db.Table('playlist_track',
    db.Column('playlist_id', db.Integer, db.ForeignKey('playlists.id'), primary_key=True),
    db.Column('track_id', db.Integer, db.ForeignKey('tracks.id'), primary_key=True)
)
