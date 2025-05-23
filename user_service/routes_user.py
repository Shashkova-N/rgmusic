# routes_user.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, User
from auth import bcrypt, create_jwt
from flask_jwt_extended import jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__, url_prefix='/auth')

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error':'Email уже занят'}), 400

        birth = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        pw_hash = bcrypt.generate_password_hash(data['password']).decode()
        user = User(
            full_name=data['full_name'],
            email=data['email'],
            country=data['country'],
            region=data['region'],
            birth_date=birth,
            password_hash=pw_hash
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message':'Пользователь создан','user_id':user.id}), 201

    except (KeyError, ValueError):
        return jsonify({'error':'Неправильные данные'}), 400

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password','')):
        # Генерируем JWT с дополнительным полем role
        token = create_jwt(user.id, user.role)
        return jsonify({
            'access_token': token,
            'user_id': user.id,
            'role': user.role
        }), 200

    return jsonify({'error':'Неверный email или пароль'}), 401

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    if get_jwt_identity() != str(user_id):
        return jsonify({'error':'Forbidden'}), 403
    u = User.query.get_or_404(user_id)
    return jsonify({
        'id': u.id,
        'full_name': u.full_name,
        'email': u.email,
        'country': u.country,
        'region': u.region,
        'birth_date': u.birth_date.strftime('%Y-%m-%d'),
        'role': u.role
    }), 200

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if get_jwt_identity() != str(user_id):
        return jsonify({'error':'Forbidden'}), 403
    u = User.query.get_or_404(user_id)
    data = request.get_json()
    try:
        u.full_name    = data.get('full_name', u.full_name)
        u.email        = data.get('email', u.email)
        u.country      = data.get('country', u.country)
        u.region       = data.get('region', u.region)
        if 'birth_date' in data:
            u.birth_date = datetime.strptime(data['birth_date'],'%Y-%m-%d').date()
        if 'password' in data:
            u.password_hash = bcrypt.generate_password_hash(data['password']).decode()
        # Разрешаем менять роль (только админом)
        if 'role' in data:
            u.role = data['role']
        db.session.commit()
        return jsonify({'message':'Данные обновлены'}), 200
    except ValueError:
        return jsonify({'error':'Неверный формат даты'}), 400
