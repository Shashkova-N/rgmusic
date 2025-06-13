from flask import Blueprint, request, jsonify, current_app
from models import db, Cart, CartItem
import uuid, requests
from datetime import datetime, timedelta

cart_bp = Blueprint('cart', __name__, url_prefix='/cart')

@cart_bp.route('/add', methods=['POST', 'OPTIONS'])
def add_to_cart():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    track_id = data.get('track_id')
    session_id = data.get('session_id')

    if not track_id:
        return jsonify({'error': 'track_id is required'}), 400

    user_id = request.headers.get('X-User-ID')

    if not user_id and not session_id:
        return jsonify({'error': 'Either user_id or session_id must be provided'}), 400

    cart = Cart.query.filter_by(user_id=user_id).first() if user_id else Cart.query.filter_by(session_id=session_id).first()

    if not cart:
        cart = Cart(user_id=user_id, session_id=session_id)
        db.session.add(cart)
        db.session.commit()

    existing_item = CartItem.query.filter_by(cart_id=cart.id, track_id=track_id).first()
    if existing_item:
        return jsonify({'message': 'Track already in cart'}), 200

    new_item = CartItem(cart_id=cart.id, track_id=track_id)
    db.session.add(new_item)
    db.session.commit()

    return jsonify({'message': 'Track added to cart'}), 201


@cart_bp.route('/', methods=['GET'])
def get_cart():
    user_id = request.headers.get('X-User-ID')
    session_id = request.args.get('session_id')

    if not user_id and not session_id:
        return jsonify({'error': 'Either user_id or session_id must be provided'}), 400

    cart = Cart.query.filter_by(user_id=user_id).first() if user_id else Cart.query.filter_by(session_id=session_id).first()

    if not cart:
        return jsonify({'items': []}), 200

    enriched_items = []

    for item in cart.items:
        track_id = item.track_id

        try:
            response = requests.get(
                f"{current_app.config['TRACK_SERVICE_URL']}/tracks/{track_id}",
                timeout=3
            )
            if response.status_code == 200:
                track_data = response.json()
                enriched_items.append({
                    'id': item.id,
                    'track_id': track_id,
                    'title': f"Track_{track_data.get('vk_number')}",
                    'price': track_data.get('price'),
                    'duration': track_data.get('duration'),
                })
            else:
                enriched_items.append({
                    'id': item.id,
                    'track_id': track_id,
                    'title': f"Track #{track_id}",
                    'price': 0,
                    'duration': 0,
                })
        except Exception as e:
            current_app.logger.error(f"Ошибка запроса к track_service: {e}")
            enriched_items.append({
                'id': item.id,
                'track_id': track_id,
                'title': f"Track #{track_id}",
                'price': 0,
                'duration': 0,
            })

    return jsonify({'items': enriched_items}), 200


@cart_bp.route('/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    item = CartItem.query.get(item_id)

    if not item:
        return jsonify({'error': 'Cart item not found'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item removed from cart'}), 200


@cart_bp.route('/item/<int:item_id>', methods=['OPTIONS'])
def cart_item_options(item_id):
    return '', 200


@cart_bp.route('/add', methods=['OPTIONS'])
def handle_options():
    return '', 200


@cart_bp.route('/count', methods=['GET'])
def get_cart_count():
    user_id = request.headers.get('X-User-ID')
    session_id = request.args.get('session_id')

    if not user_id and not session_id:
        return jsonify({'error': 'Either user_id or session_id must be provided'}), 400

    cart = Cart.query.filter_by(user_id=user_id).first() if user_id else Cart.query.filter_by(session_id=session_id).first()

    count = len(cart.items) if cart else 0
    return jsonify({'count': count}), 200


@cart_bp.route('/clear', methods=['DELETE'])
def clear_cart():
    user_id = request.headers.get('X-User-ID')
    session_id = request.args.get('session_id')

    if not user_id and not session_id:
        return jsonify({'error': 'Either user_id or session_id must be provided'}), 400

    cart = Cart.query.filter_by(user_id=user_id).first() if user_id else Cart.query.filter_by(session_id=session_id).first()

    if not cart:
        return jsonify({'message': 'Cart already empty'}), 200

    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()

    return jsonify({'message': 'Cart cleared'}), 200


@cart_bp.route('/clear', methods=['OPTIONS'])
def handle_clear_options():
    return '', 200
