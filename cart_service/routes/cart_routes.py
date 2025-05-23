from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import Cart
import uuid, requests
from datetime import datetime, timedelta

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')

@cart_bp.route('', methods=['POST'])
def add_to_cart():
    data = request.get_json()
    session_id = request.headers.get('Session-ID') or str(uuid.uuid4())
    user_id = data.get('user_id')
    track_id = data.get('track_id')

    # проверка региональных покупок через user_service
    if user_id:
        try:
            auth = request.headers.get('Authorization')
            # 1) получить регион
            r = requests.get(
                f'http://user_service:5000/users/{user_id}',
                headers={'Authorization': auth}
            )
            if r.status_code != 200:
                return jsonify({'error': 'Не удалось получить данные пользователя'}), 400
            region = r.json()['region']

            # 2) проверить прошлые покупки
            one_year_ago = (datetime.utcnow() - timedelta(days=365)).isoformat()
            r2 = requests.get(
                f'http://user_service:5000/users/{user_id}/purchases',
                headers={'Authorization': auth}
            )
            if r2.status_code == 200:
                for p in r2.json():
                    if (p['track_id'] == track_id and 
                        p['region'] == region and 
                        p['purchase_date'] >= one_year_ago):
                        return jsonify({
                            'message': 'Этот трек уже был куплен в вашем регионе за последний год',
                            'session_id': session_id
                        }), 400
        except requests.RequestException:
            return jsonify({'error': 'Ошибка при проверке покупок'}), 500

    # добавить или обновить корзину
    cart = Cart.query.filter(
        (Cart.session_id == session_id) | (Cart.user_id == user_id)
    ).first()
    if cart:
        ids = cart.track_ids.split(',')
        if str(track_id) not in ids:
            ids.append(str(track_id))
            cart.track_ids = ','.join(ids)
    else:
        cart = Cart(session_id=session_id, user_id=user_id, track_ids=str(track_id))
        db.session.add(cart)

    db.session.commit()
    return jsonify({'message': 'Трек добавлен в корзину', 'session_id': session_id}), 200

@cart_bp.route('', methods=['GET'])
def get_cart():
    session_id = request.headers.get('Session-ID')
    user_id = request.args.get('user_id', type=int)
    if not session_id and not user_id:
        return jsonify({'error': 'Требуется session_id или user_id'}), 400

    cart = Cart.query.filter(
        (Cart.session_id == session_id) | (Cart.user_id == user_id)
    ).first()
    if not cart:
        return jsonify({'message': 'Корзина пуста'}), 404

    return jsonify({
        'session_id': cart.session_id,
        'user_id': cart.user_id,
        'track_ids': cart.track_ids.split(',')
    }), 200
