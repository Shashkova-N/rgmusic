from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from models import db, Track
from datetime import datetime
from werkzeug.utils import secure_filename

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
            # Исправленный URL — теперь он указывает на /media/watermarked/
            'file_url': f'/media/watermarked/{t.file_watermarked}' if t.file_watermarked else None
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
    Отдаёт полный список треков со всеми полями (кроме id),
    чтобы админка могла отобразить/редактировать любую информацию.
    """
    tracks = Track.query.all()
    result = []
    for t in tracks:
        result.append({
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
            'upload_date': t.upload_date.isoformat() if isinstance(t.upload_date, datetime) else t.upload_date,
        })
    return jsonify(result), 200


@track_bp.route('/admin', methods=['POST'])
def create_track_admin():
    try:
        # Получаем данные формы
        form = request.form
        title = form['title']
        artist = form['artist']
        genre = form.get('genre')
        tempo = form.get('tempo')
        voice = form.get('voice')
        duration = int(form.get('duration', 0))
        language = form.get('language')
        composer = form.get('composer')
        poet = form.get('poet')
        studio = form.get('studio')
        price = float(form['price'])
        vk_number = form.get('vk_number')
        is_visible = form.get('is_visible', 'true').lower() in ('1', 'true', 'yes')

        # Получаем файлы
        file_clean = request.files.get('file_clean')
        file_wm = request.files.get('file_watermarked')

        if not file_clean or not file_clean.filename:
            return jsonify({"error": "Не передан оригинальный файл (clean)"}), 400

        if not file_wm or not file_wm.filename:
            return jsonify({"error": "Не передан водяной знак (watermarked)"}), 400

        # Определяем путь к медиа
        base = os.path.abspath('media')  # <-- сохраняем в текущую директорию, чтобы совпадало с volume
        clean_dir = os.path.join(base, 'clean')
        wm_dir = os.path.join(base, 'watermarked')

        os.makedirs(clean_dir, exist_ok=True)
        os.makedirs(wm_dir, exist_ok=True)

        # Безопасные имена
        filename_clean = secure_filename(file_clean.filename)
        filename_wm = secure_filename(file_wm.filename)

        # Пути для сохранения
        clean_path = os.path.join(clean_dir, filename_clean)
        wm_path = os.path.join(wm_dir, filename_wm)

        # Сохраняем файлы
        file_clean.save(clean_path)
        file_wm.save(wm_path)

        # Создаём запись в БД
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
        print("Ошибка при создании трека:", str(e))
        return jsonify({"error": "Ошибка сервера", "details": str(e)}), 500