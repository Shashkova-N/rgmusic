from flask import Blueprint, request, jsonify, send_from_directory
from sqlalchemy import and_, func, inspect
from models import db, Playlist, Track
from models.association import playlist_track
import os
from werkzeug.utils import secure_filename

playlist_bp = Blueprint('playlists', __name__, url_prefix='/playlists')

# Получить список всех плейлистов с базовой информацией и количеством треков
@playlist_bp.route('', methods=['GET'])
def get_all_playlists():
    playlists = Playlist.query \
        .filter_by(is_visible=True) \
        .order_by(Playlist.manual_order.desc()) \
        .all()

    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'cover_image': p.cover_image,
        'track_count': len(p.tracks),
        'views': p.views,
        'manual_order': p.manual_order
    } for p in playlists]), 200


# Получить подробную информацию о конкретном плейлисте (без треков)
@playlist_bp.route('/<int:playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)

    # playlist.views += 1
    # state = inspect(playlist)
    # if 'updated_at' in state.unmodified:
    #     state.unmodified.remove('updated_at')

    # db.session.commit()

    return jsonify({
        'id': playlist.id,
        'name': playlist.name,
        'description': playlist.description,
        'cover_image': playlist.cover_image,
        'track_count': len(playlist.tracks),
        'views': playlist.views,
        'manual_order': playlist.manual_order,
        'updated_at': playlist.updated_at.isoformat() if playlist.updated_at else None
    }), 200


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


@playlist_bp.route('/admin', methods=['POST'])
def create_playlist():
    form = request.form
    name = form.get('name')
    description = form.get('description')
    is_visible = form.get('is_visible', 'true').lower() in ('1','true','yes')

    if not name:
        return jsonify({"error": "Не указано название плейлиста"}), 400

    # Получаем обложку (если есть)
    cover_image = request.files.get('cover_image')
    cover_dir = os.path.abspath('media/playlist_images')
    os.makedirs(cover_dir, exist_ok=True)

    # Сохраняем файл, если он передан
    cover_filename = None
    if cover_image and cover_image.filename:
        cover_filename = secure_filename(cover_image.filename)
        cover_path = os.path.join(cover_dir, cover_filename)
        cover_image.save(cover_path)

    # Создаём новый плейлист
    new_playlist = Playlist(
        name=name,
        description=description,
        cover_image=cover_filename,
        is_visible=is_visible,
        views=0,  # Новый плейлист ещё никто не просматривал
        manual_order = 0
    )

    try:
        db.session.add(new_playlist)
        db.session.commit()
        return jsonify({
            'message': 'Плейлист успешно создан',
            'playlist': {
                'id': new_playlist.id,
                'name': new_playlist.name,
                'cover_image': new_playlist.cover_image,
                'views': new_playlist.views
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print("Ошибка при создании плейлиста:", str(e))
        return jsonify({"error": "Не удалось создать плейлист", "details": str(e)}), 500
    

@playlist_bp.route('/admin', methods=['GET'])
def get_playlists_admin():
    sort_by = request.args.get('sort_by', 'manual_order')

    sort_column = {
        'name': Playlist.name.asc(),
        'updated_at': Playlist.updated_at.desc(),
        'views': Playlist.views.desc(),
        'track_count': func.count(playlist_track.c.track_id).desc(),
        'manual_order': Playlist.manual_order.asc()
    }.get(sort_by, Playlist.manual_order.asc())

    query = db.session.query(Playlist).outerjoin(playlist_track).group_by(Playlist.id).order_by(sort_column)
    playlists = query.all()

    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'cover_image': p.cover_image,
            'track_count': len(p.tracks),
            'views': p.views,
            'manual_order': p.manual_order
        } for p in playlists
    ]), 200


@playlist_bp.route('/admin/settings/order', methods=['POST'])
def update_manual_order():
    try:
        updates = request.json  # [{'id': 1, 'manual_order': 0}, {'id': 2, 'manual_order': 1}, ...]
        if not isinstance(updates, list):
            return jsonify({'error': 'Ожидается список плейлистов'}), 400

        for item in updates:
            playlist_id = item.get('id')
            manual_order = item.get('manual_order')

            if playlist_id is None or manual_order is None:
                continue

            Playlist.query.filter_by(id=playlist_id).update({'manual_order': manual_order})

        db.session.commit()
        return jsonify({'message': 'Порядок успешно обновлён'}), 200

    except Exception as e:
        db.session.rollback()
        print("Ошибка при обновлении порядка плейлистов:", str(e))
        return jsonify({'error': 'Ошибка сервера', 'details': str(e)}), 500
    
    
@playlist_bp.route('/media/covers/<path:filename>', methods=['GET'])
def serve_cover_image(filename):
    cover_dir = os.path.abspath('media/playlist_images')
    return send_from_directory(cover_dir, filename)


# @track_bp.route('/media/watermarked/<path:filename>', methods=['GET'])
# def serve_watermarked(filename):
#     wm_dir = os.path.abspath('media/watermarked')
#     print("Serving from:", wm_dir)
#     return send_from_directory(wm_dir, filename)