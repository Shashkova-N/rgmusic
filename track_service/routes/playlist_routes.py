from flask import Blueprint, request, jsonify
from sqlalchemy import and_, func
from models import db, Playlist, Track
from models.association import playlist_track

playlist_bp = Blueprint('playlists', __name__, url_prefix='/playlists')

# Получить список всех плейлистов с базовой информацией и количеством треков
@playlist_bp.route('', methods=['GET'])
def get_all_playlists():
    playlists = Playlist.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'cover_image': p.cover_image,
        'track_count': len(p.tracks)  # количество треков в плейлисте
    } for p in playlists]), 200


# Получить подробную информацию о конкретном плейлисте (без треков)
@playlist_bp.route('/<int:playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)
    return jsonify({
        'id': playlist.id,
        'name': playlist.name,
        'description': playlist.description,
        'cover_image': playlist.cover_image,
        'track_count': len(playlist.tracks),
    })


# Получить треки плейлиста с возможностью фильтрации по жанру, темпу, голосу, языку и цене
@playlist_bp.route('/<int:playlist_id>/tracks', methods=['GET'])
def get_filtered_tracks(playlist_id):
    genre = request.args.get('genre')
    tempo = request.args.get('tempo')
    voice = request.args.get('voice')
    language = request.args.get('language')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    
    limit = request.args.get('limit', default=3, type=int)
    offset = request.args.get('offset', default=0, type=int)

    query = db.session.query(Track).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id
    )

    filters = []
    if genre:
        filters.append(Track.genre == genre)
    if tempo:
        filters.append(Track.tempo == tempo)
    if voice:
        filters.append(Track.voice == voice)
    if language:
        filters.append(Track.language == language)
    if min_price is not None:
        filters.append(Track.price >= min_price)
    if max_price is not None:
        filters.append(Track.price <= max_price)

    if filters:
        query = query.filter(and_(*filters))
    
    total_tracks = query.count()
    tracks = query.offset(offset).limit(limit).all()

    return jsonify({
        'total': total_tracks,
        'limit': limit,
        'offset': offset,
        'has_next': offset + limit < total_tracks,
        'tracks': [{
            'id': t.id,
            'vk_number': t.vk_number,
            'duration': t.duration,
            'price': t.price,
            'file_watermarked': t.file_watermarked
        } for t in tracks]
    })


# Получить список фильтров (жанры, темпы, голоса, языки, мин/макс цены) по трекам в плейлисте
@playlist_bp.route('/<int:playlist_id>/filters', methods=['GET'])
def get_filters_for_playlist(playlist_id):
    # Проверяем, что плейлист существует (иначе 404)
    playlist = Playlist.query.get_or_404(playlist_id)

    # Формируем запрос по трекам плейлиста, только видимым
    query = db.session.query(Track).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True
    )

    # Получаем уникальные значения с помощью SQL запросов с distinct
    genres = [row[0] for row in db.session.query(Track.genre).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True,
        Track.genre != None
    ).distinct().all()]

    tempos = [row[0] for row in db.session.query(Track.tempo).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True,
        Track.tempo != None
    ).distinct().all()]

    voices = [row[0] for row in db.session.query(Track.voice).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True,
        Track.voice != None
    ).distinct().all()]

    languages = [row[0] for row in db.session.query(Track.language).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True,
        Track.language != None
    ).distinct().all()]

    # Получаем минимальную и максимальную цену треков плейлиста с фильтром видимости
    min_price = db.session.query(func.min(Track.price)).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True
    ).scalar()

    max_price = db.session.query(func.max(Track.price)).join(
        playlist_track, Track.id == playlist_track.c.track_id
    ).filter(
        playlist_track.c.playlist_id == playlist_id,
        Track.is_visible == True
    ).scalar()

    return jsonify({
        "genres": sorted(genres),
        "languages": sorted(languages),
        "tempos": sorted(tempos),
        "voices": sorted(voices),
        "min_price": min_price,
        "max_price": max_price
    })