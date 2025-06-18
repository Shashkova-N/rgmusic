from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Purchase  # без точек впереди

pur_bp = Blueprint('purchase', __name__, url_prefix='/users/<int:user_id>/purchases')

@pur_bp.route('', methods=['GET'])
@jwt_required()
def get_purchases(user_id):
    if get_jwt_identity() != str(user_id):
        return jsonify({'error': 'Forbidden'}), 403
    lst = Purchase.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': p.id,
        'track_id': p.track_id,
        'price': p.price,
        'purchase_date': p.purchase_date.isoformat(),
        'country': p.country,
        'region': p.region
    } for p in lst]), 200

@pur_bp.route('', methods=['POST'])
def add_purchase(user_id):
    # user_id == 0 будет означать гостя
    data = request.get_json() or {}
    # Проверяем необходимые поля
    required = ['email', 'country', 'region', 'track_id', 'price']
    if not all(field in data for field in required):
        return jsonify({'error': 'Неполные данные'}), 400

    # Для гостя сохраняем user_id None
    uid = None if user_id == 0 else user_id

    p = Purchase(
        user_id=uid,
        email=data['email'],
        country=data['country'],
        region=data['region'],
        track_id=data['track_id'],
        price=data['price']
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Покупка добавлена', 'purchase_id': p.id}), 201
