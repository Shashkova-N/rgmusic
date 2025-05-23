from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(fn):
    """Декоратор: разрешает доступ только пользователям с ролью 'admin'."""
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = User.query.get(int(get_jwt_identity()))
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Forbidden'}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    """Вернуть список всех пользователей (id, имя, email, роль)."""
    users = User.query.all()
    return jsonify([
        {
            'id': u.id,
            'full_name': u.full_name,
            'email': u.email,
            'role': u.role
        }
        for u in users
    ]), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def change_role(user_id):
    """Изменить роль пользователя."""
    data = request.get_json() or {}
    new_role = data.get('role')
    if new_role not in ['user', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400

    user = User.query.get_or_404(user_id)
    user.role = new_role
    db.session.commit()
    return jsonify({'message': 'Role updated'}), 200
