from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .track import Track
from .playlist import Playlist
from .association import playlist_track
