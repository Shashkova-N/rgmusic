from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from models import db, Track

track_bp = Blueprint('tracks', __name__, url_prefix='/tracks')


@track_bp.route('', methods=['GET'])
def get_tracks():
    offset = request.args.get('offset', 0, type=int)
    limit = request.args.get('limit', 3, type=int)

    genre = request.args.get('genre')
    tempo = request.args.get('tempo')
    voice = request.args.get('voice')
    language = request.args.get('language')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_duration = request.args.get('min_duration', type=int)
    max_duration = request.args.get('max_duration', type=int)

    query = Track.query.filter_by(is_visible=True)

    if genre:
        query = query.filter(Track.genre == genre)
    if tempo:
        query = query.filter(Track.tempo == tempo)
    if voice:
        query = query.filter(Track.voice == voice)
    if language:
        query = query.filter(Track.language == language)
    if min_price is not None:
        query = query.filter(Track.price >= min_price)
    if max_price is not None:
        query = query.filter(Track.price <= max_price)
    if min_duration is not None:
        query = query.filter(Track.duration >= min_duration)
    if max_duration is not None:
        query = query.filter(Track.duration <= max_duration)

    total_count = query.count()
    tracks = query.offset(offset).limit(limit).all()

    return jsonify({
        'tracks': [{
            'id': t.id,
            'vk_number': t.vk_number,
            'duration': t.duration,
            'price': t.price,
            'file_watermarked': t.file_watermarked,
            # ты можешь добавить сюда прямой URL:
            'file_url': f'/tracks/media/{t.file_watermarked}' if t.file_watermarked else None
        } for t in tracks],
        'total_count': total_count,
        'offset': offset,
        'limit': limit,
        'has_next': offset + limit < total_count
    }), 200


@track_bp.route('/filters', methods=['GET'])
def get_track_filters():
    genres = [row[0] for row in db.session.query(Track.genre).filter(Track.genre != None).filter(Track.is_visible==True).distinct().all()]
    tempos = [row[0] for row in db.session.query(Track.tempo).filter(Track.tempo != None).filter(Track.is_visible==True).distinct().all()]
    voices = [row[0] for row in db.session.query(Track.voice).filter(Track.voice != None).filter(Track.is_visible==True).distinct().all()]
    languages = [row[0] for row in db.session.query(Track.language).filter(Track.language != None).filter(Track.is_visible==True).distinct().all()]
    min_price = db.session.query(db.func.min(Track.price)).filter(Track.is_visible==True).scalar()
    max_price = db.session.query(db.func.max(Track.price)).filter(Track.is_visible==True).scalar()
    min_duration = db.session.query(db.func.min(Track.duration)).filter(Track.is_visible==True).scalar()
    max_duration = db.session.query(db.func.max(Track.duration)).filter(Track.is_visible==True).scalar()

    return jsonify({
        "genres": genres,
        "languages": languages,
        "tempos": tempos,
        "voices": voices,
        "min_price": min_price,
        "max_price": max_price,
        "min_duration": min_duration,
        "max_duration": max_duration
    })


@track_bp.route('/media/<path:filename>', methods=['GET'])
def serve_media(filename):
    media_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'media'))
    return send_from_directory(media_dir, filename)
