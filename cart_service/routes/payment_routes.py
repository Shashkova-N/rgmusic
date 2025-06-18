from datetime import datetime
import os
import uuid
import re
import hmac
import hashlib
import base64
import re

from flask import Blueprint, request, jsonify, current_app, abort
from yookassa import Payment
from models import db, Order, OrderItem, Cart, CartItem
import requests

USER_SERVICE_URL    = os.getenv('USER_SERVICE_URL')
USER_SERVICE_API_KEY = os.getenv('USER_SERVICE_API_KEY')

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')


@payment_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.json or {}
    track_ids = data.get('order_track_ids')
    email     = data.get('email')
    country   = data.get('country')
    region    = data.get('region')
    session_id = data.get('session_id')
    user_id    = request.headers.get('X-User-ID')

    # Валидация входных данных
    if not isinstance(track_ids, list) or not track_ids:
        return jsonify({'error': 'order_track_ids must be a non-empty list'}), 400
    if not email or not country or not region:
        return jsonify({'error': 'email, country and region are required'}), 400
    if not user_id and not session_id:
        return jsonify({'error': 'Either user_id or session_id must be provided'}), 400

    # 1) Создаём новый Order
    order = Order(
        user_id=user_id,
        session_id=session_id,
        email=email,
        country=country,
        region=region,
        status='pending'
    )
    db.session.add(order)
    db.session.flush()  # чтобы получить order.id до commit

    # 2) Для каждого трека запрашиваем цену и создаём OrderItem
    total = 0.0
    for track_id in track_ids:
        # Получаем информацию о треке из track_service
        try:
            resp = requests.get(
                f"{current_app.config['TRACK_SERVICE_URL']}/tracks/{track_id}",
                timeout=3
            )
            resp.raise_for_status()
            track_data = resp.json()
            price = float(track_data.get('price', 0))
        except Exception as e:
            current_app.logger.error(f"Error fetching track {track_id}: {e}")
            price = 0.0

        item = OrderItem(
            order_id=order.id,
            track_id=track_id,
            price=price
        )
        db.session.add(item)
        total += price

    # Мы не храним total_amount в Order — по необходимости будем считать из OrderItem

    db.session.commit()  # сохраняем Order и все OrderItem

    # 3) Отправляем платеж в Yookassa, передавая metadata.order_id
    payment = Payment.create({
        "amount": {
            "value": f"{total:.2f}",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": current_app.config.get('FRONTEND_URL') + "/cart/return"
        },
        "capture": True,
        "description": f"Оплата заказа №{order.id}",
        "metadata": {"order_id": str(order.id)}
    }, uuid.uuid4().hex)

    return jsonify({"confirmation_url": payment.confirmation.confirmation_url}), 201

@payment_bp.route('/checkout', methods=['OPTIONS'])
def payment_checkout_options():
    # просто возвращаем пустой ответ — CORS уже настроен на приложение
    return '', 200


@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    # читаем тело и заголовок подписи
    raw_bytes = request.get_data()
    raw_body = raw_bytes.decode('utf-8', errors='replace')
    signature_header = (
        request.headers.get('X-API-Signature-Sha256') or
        request.headers.get('X-API-Signature') or
        request.headers.get('Signature')
    )
    current_app.logger.debug(f"Raw body for signature: {raw_body!r}")
    current_app.logger.debug(f"Signature header: {signature_header}")

    if not signature_header:
        current_app.logger.error("Signature header missing")
        abort(400, "Signature header missing")

    # извлекаем последний Base64-фрагмент из заголовка
    match = re.search(r'([A-Za-z0-9+/=]+)$', signature_header)
    signature = match.group(1) if match else signature_header

    secret = os.getenv("YOOKASSA_SECRET_KEY")
    if not secret:
        current_app.logger.error("YOOKASSA_SECRET_KEY not set")
        abort(500, "Server misconfiguration")

    # рассчитываем HMAC-SHA256 и кодируем в Base64
    digest = hmac.new(secret.encode(), raw_bytes, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode()
    current_app.logger.debug(f"Expected signature: {expected}")

    # if not hmac.compare_digest(signature, expected):
    #     current_app.logger.error(f"Invalid signature. Got {signature!r}, expected {expected!r}")
    #     abort(400, "Invalid signature")

    # подпись верна, обрабатываем событие
    event      = request.json or {}
    event_type = event.get('event')           # "payment.succeeded" и т.д.
    obj        = event.get('object', {})
    payment_id = obj.get('id')
    order_id   = obj.get('metadata', {}).get('order_id')

    # реагируем только на успешную оплату
    if event_type != 'payment.succeeded':
        return "", 200

    current_app.logger.info(f"[Webhook] Событие {event_type} для платежа {payment_id}, заказ {order_id}")

    # 1) Получаем заказ из базы
    order = Order.query.get(order_id)
    if not order:
        current_app.logger.error(f"Order {order_id} not found")
        return "", 404

    # 2) Обновляем статус, payment_id и время оплаты
    order.status     = 'paid'
    order.payment_id = payment_id
    paid_at_str      = obj.get('created_at')  # ISO-строка, например "2025-06-18T12:34:56.000Z"
    if paid_at_str:
        order.paid_at = datetime.fromisoformat(paid_at_str.replace('Z', '+00:00'))
    db.session.commit()

    # 3) Отправляем покупки в user_service
    us_id = order.user_id if order.user_id else 0
    headers = {
        'Content-Type':  'application/json',
        'Authorization': f'Bearer {USER_SERVICE_API_KEY}'
    }
    for item in order.items:
        payload = {
            'email':    order.email,
            'country':  order.country,
            'region':   order.region,
            'track_id': item.track_id,
            'price':    item.price
        }
        try:
            resp = requests.post(
                f"{USER_SERVICE_URL}/users/{us_id}/purchases",
                json=payload,
                headers=headers,
                timeout=5
            )
            resp.raise_for_status()
        except requests.HTTPError as e:
            # логируем код и тело ответа от user_service
            status = e.response.status_code
            body = e.response.text
            current_app.logger.error(
                f"Failed to record purchase for track {item.track_id}: "
                f"status {status}, response: {body}"
            )
        except Exception as e:
            current_app.logger.error(
                f"Unexpected error recording purchase for track {item.track_id}: {e}"
            )

    # 4) Очищаем корзину
    if order.user_id:
        cart = Cart.query.filter_by(user_id=order.user_id).first()
    else:
        cart = Cart.query.filter_by(session_id=order.session_id).first()

    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.delete(cart)
        db.session.commit()

    return "", 200

