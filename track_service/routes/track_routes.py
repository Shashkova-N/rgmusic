from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from models import db, Track
from datetime import datetime
from werkzeug.utils import secure_filename
import traceback

track_bp = Blueprint('tracks', __name__, url_prefix='/tracks')


@track_bp.route('', methods=['GET'])
def get_tracks():
    offset = request.args.get('offset', 0, type=int)
    limit = request.args.get('limit', 3, type=int)

    genres = request.args.getlist('genre')
    tempos = request.args.getlist('tempo')
    voices = request.args.getlist('voice')
    languages = request.args.getlist('language')
    durations = request.args.getlist('duration', type=int)  # <--- добавили
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    query = Track.query.filter_by(is_visible=True)

    if genres:
        query = query.filter(Track.genre.in_(genres))
    if tempos:
        query = query.filter(Track.tempo.in_(tempos))
    if voices:
        query = query.filter(Track.voice.in_(voices))
    if languages:
        query = query.filter(Track.language.in_(languages))
    if durations:
        query = query.filter(Track.duration.in_(durations))  # <--- фильтрация
    if min_price is not None:
        query = query.filter(Track.price >= min_price)
    if max_price is not None:
        query = query.filter(Track.price <= max_price)

    vk_number = request.args.get('vk_number')
    if vk_number:
        query = query.filter(Track.vk_number.ilike(f'%{vk_number}%'))

    total_count = query.count()
    tracks = query.offset(offset).limit(limit).all()

    return jsonify({
        'tracks': [{
            'id': t.id,
            'vk_number': t.vk_number,
            'duration': t.duration,
            'price': t.price,
            'file_watermarked': t.file_watermarked,
            'file_url': f'/media/watermarked/{t.file_watermarked}' if t.file_watermarked else None
        } for t in tracks],
        'total_count': total_count,
        'offset': offset,
        'limit': limit,
        'has_next': offset + limit < total_count
    }), 200


@track_bp.route('/<int:id>', methods=['GET'])
def get_track_by_id_user(id):
    track = Track.query.get(id)
    if not track:
        return jsonify({"error": "Трек не найден"}), 404

    return jsonify({
        'id': track.id,
        'genre': track.genre,
        'tempo': track.tempo,
        'voice': track.voice,
        'duration': track.duration,
        'language': track.language,
        'price': track.price,
        'vk_number': track.vk_number,
        'file_watermarked': track.file_watermarked,
    }), 200


@track_bp.route('/filters', methods=['GET'])
def get_track_filters():
    genres = [row[0] for row in db.session.query(Track.genre)
              .filter(Track.genre != None, Track.is_visible == True)
              .distinct().all()]
    tempos = [row[0] for row in db.session.query(Track.tempo)
              .filter(Track.tempo != None, Track.is_visible == True)
              .distinct().all()]
    voices = [row[0] for row in db.session.query(Track.voice)
              .filter(Track.voice != None, Track.is_visible == True)
              .distinct().all()]
    languages = [row[0] for row in db.session.query(Track.language)
                 .filter(Track.language != None, Track.is_visible == True)
                 .distinct().all()]
    durations = [row[0] for row in db.session.query(Track.duration)
                 .filter(Track.duration != None, Track.is_visible == True)
                 .distinct().all()]
    
    # если хочешь оставить min/max — можно
    min_price = db.session.query(db.func.min(Track.price)).filter(Track.is_visible == True).scalar()
    max_price = db.session.query(db.func.max(Track.price)).filter(Track.is_visible == True).scalar()

    return jsonify({
        "genres": genres,
        "languages": languages,
        "tempos": tempos,
        "voices": voices,
        "durations": sorted(durations),
        "min_price": min_price,
        "max_price": max_price
    })


# # Теперь сервер отдаёт файлы из media/watermarked
# @track_bp.route('/media/watermarked/<path:filename>', methods=['GET'])
# def serve_watermarked(filename):
#     wm_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'media', 'watermarked'))
#     print("Serving from:", wm_dir)
#     return send_from_directory(wm_dir, filename)

@track_bp.route('/media/watermarked/<path:filename>', methods=['GET'])
def serve_watermarked(filename):
    wm_dir = os.path.abspath('media/watermarked')
    print("Serving from:", wm_dir)
    return send_from_directory(wm_dir, filename)


# Если нужно — можно добавить и для clean:
@track_bp.route('/media/clean/<path:filename>', methods=['GET'])
def serve_clean(filename):
    clean_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'media', 'clean'))
    return send_from_directory(clean_dir, filename)


@track_bp.route('/admin', methods=['GET'])
def get_all_tracks_admin():
    """
    Получаем все треки (для админки)
    Можно фильтровать по цене: /tracks/admin?price=100
    """
    query = Track.query

    # Фильтр по цене (если передан)
    price_filter = request.args.get('price', type=float)
    if price_filter:
        query = query.filter(Track.price == price_filter)

    tracks = query.all()
    result = [{
        'id': t.id,
        'title': t.title,
        'artist': t.artist,
        'genre': t.genre,
        'tempo': t.tempo,
        'voice': t.voice,
        'duration': t.duration,
        'language': t.language,
        'composer': t.composer,
        'poet': t.poet,
        'studio': t.studio,
        'price': t.price,
        'vk_number': t.vk_number,
        'file_clean': t.file_clean,
        'file_watermarked': t.file_watermarked,
        'is_visible': t.is_visible,
        'upload_date': t.upload_date.isoformat() if t.upload_date else None
    } for t in tracks]

    return jsonify(result), 200


@track_bp.route('/admin', methods=['POST'])
def create_track_admin():
    try:
        # Получаем данные формы
        form = request.form
        title = form.get('title')
        artist = form.get('artist')
        genre = form.get('genre')
        tempo = form.get('tempo')
        voice = form.get('voice')
        language = form.get('language')
        composer = form.get('composer')
        poet = form.get('poet')
        studio = form.get('studio')
        vk_number = form.get('vk_number')
        is_visible = form.get('is_visible', 'true').lower() in ('1', 'true', 'yes')

        # Проверка обязательных полей
        if not title:
            return jsonify({"error": "Не указано название трека"}), 400
        if not artist:
            return jsonify({"error": "Не указан исполнитель"}), 400

        # Обработка duration
        try:
            duration = int(form.get('duration', 0))
        except ValueError:
            return jsonify({"error": "Длительность трека должна быть числом"}), 400

        # Обработка цены
        try:
            price = float(form.get('price', ''))
        except (ValueError, TypeError):
            return jsonify({"error": "Некорректная цена"}), 400

        # Получаем файлы
        file_clean = request.files.get('file_clean')
        file_wm = request.files.get('file_watermarked')

        if not file_clean or not file_clean.filename:
            return jsonify({"error": "Не передан оригинальный файл (clean)"}), 400

        if not file_wm or not file_wm.filename:
            return jsonify({"error": "Не передан водяной знак (watermarked)"}), 400

        # Определяем пути к медиа
        base = os.path.abspath('media')
        clean_dir = os.path.join(base, 'clean')
        wm_dir = os.path.join(base, 'watermarked')
        os.makedirs(clean_dir, exist_ok=True)
        os.makedirs(wm_dir, exist_ok=True)

        # Сохраняем файлы
        filename_clean = secure_filename(file_clean.filename)
        filename_wm = secure_filename(file_wm.filename)
        file_clean.save(os.path.join(clean_dir, filename_clean))
        file_wm.save(os.path.join(wm_dir, filename_wm))

        # Создаём запись
        new_track = Track(
            title=title,
            artist=artist,
            genre=genre,
            tempo=tempo,
            voice=voice,
            duration=duration,
            language=language,
            composer=composer,
            poet=poet,
            studio=studio,
            price=price,
            vk_number=vk_number,
            file_clean=filename_clean,
            file_watermarked=filename_wm,
            is_visible=is_visible,
            upload_date=datetime.utcnow()
        )

        db.session.add(new_track)
        db.session.commit()

        return jsonify({
            'message': 'Трек успешно создан',
            'track': {
                'id': new_track.id,
                'title': new_track.title
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        traceback.print_exc()  # Печатает полный traceback в консоль
        return jsonify({"error": "Ошибка сервера", "details": str(e)}), 500
    

@track_bp.route('/admin/<int:id>', methods=['GET'])
def get_track_by_id(id):
    track = Track.query.get(id)
    if not track:
        return jsonify({"error": "Трек не найден"}), 404

    return jsonify({
        'id': track.id,
        'title': track.title,
        'artist': track.artist,
        'genre': track.genre,
        'tempo': track.tempo,
        'voice': track.voice,
        'duration': track.duration,
        'language': track.language,
        'composer': track.composer,
        'poet': track.poet,
        'studio': track.studio,
        'price': track.price,
        'vk_number': track.vk_number,
        'file_clean': track.file_clean,
        'file_watermarked': track.file_watermarked,
        'is_visible': track.is_visible,
        'upload_date': track.upload_date.isoformat() if track.upload_date else None
    }), 200


@track_bp.route('/admin/<int:id>', methods=['PUT'])
def update_track(id):
    # Проверяем, существует ли трек
    track = Track.query.get(id)
    if not track:
        return jsonify({"error": "Трек не найден"}), 404

    form = request.form
    title     = form.get('title')
    artist    = form.get('artist')
    genre     = form.get('genre')
    tempo     = form.get('tempo')
    voice     = form.get('voice')
    duration  = form.get('duration', type=int)
    language  = form.get('language')
    composer  = form.get('composer')
    poet      = form.get('poet')
    studio    = form.get('studio')
    price     = form.get('price', type=float)
    vk_number = form.get('vk_number')
    is_visible = form.get('is_visible', 'true').lower() in ('1','true','yes')

    # Получаем новые файлы, если они переданы
    file_clean = request.files.get('file_clean')
    file_wm = request.files.get('file_watermarked')

    # Обновляем поля
    if title: track.title = title
    if artist: track.artist = artist
    if genre: track.genre = genre
    if tempo: track.tempo = tempo
    if voice: track.voice = voice
    if duration: track.duration = duration
    if language: track.language = language
    if composer: track.composer = composer
    if poet: track.poet = poet
    if studio: track.studio = studio
    if price: track.price = price
    if vk_number: track.vk_number = vk_number
    track.is_visible = is_visible

    base = os.path.abspath('media')
    clean_dir = os.path.join(base, 'clean')
    wm_dir = os.path.join(base, 'watermarked')
    os.makedirs(clean_dir, exist_ok=True)
    os.makedirs(wm_dir, exist_ok=True)

    # Сохраняем новые файлы (если загружены)
    if file_clean:
        filename_clean = secure_filename(file_clean.filename)
        clean_path = os.path.join(clean_dir, filename_clean)
        file_clean.save(clean_path)
        track.file_clean = filename_clean

    if file_wm:
        filename_wm = secure_filename(file_wm.filename)
        wm_path = os.path.join(wm_dir, filename_wm)
        file_wm.save(wm_path)
        track.file_watermarked = filename_wm

    # Сохраняем изменения в БД
    try:
        db.session.commit()
        return jsonify({
            "message": "Трек успешно обновлён",
            "track": {
                "id": track.id,
                "title": track.title,
                "artist": track.artist,
                "is_visible": track.is_visible
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        print("Ошибка при обновлении трека:", str(e))
        return jsonify({"error": "Не удалось обновить трек", "details": str(e)}), 500
    

@track_bp.route('/admin/update-price', methods=['PUT'])
def update_tracks_price():
    data = request.get_json()
    track_ids = data.get('track_ids')
    new_price = data.get('new_price')

    if not isinstance(track_ids, list) or not new_price:
        return jsonify({"error": "Нужно указать массив track_ids и новую цену"}), 400

    try:
        tracks = Track.query.filter(Track.id.in_(track_ids)).all()

        for track in tracks:
            track.price = new_price

        db.session.commit()

        return jsonify({
            "message": f"Цена обновлена для {len(tracks)} треков",
            "updated_count": len(tracks),
            "track_ids": track_ids,
            "new_price": new_price
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Ошибка при массовом обновлении цен:", str(e))
        return jsonify({"error": "Не удалось обновить цены", "details": str(e)}), 500