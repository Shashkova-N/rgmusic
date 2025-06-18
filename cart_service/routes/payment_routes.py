import os
import uuid
import hmac
import hashlib
import base64
import re

from flask import Blueprint, request, jsonify, current_app, abort
from yookassa import Payment

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')


@payment_bp.route('/checkout', methods=['POST'])
def checkout():
    data = request.json  # ожидаем {"order_id": 123, "amount": 902.00}
    order_id = data.get('order_id')
    amount = data.get('amount')

    payment = Payment.create({
        "amount": {"value": f"{amount:.2f}", "currency": "RUB"},
        "confirmation": {"type": "redirect", "return_url": "http://localhost:3000/cart/return"},
        "capture": True,
        "description": f"Оплата заказа №{order_id}",
        "metadata": {"order_id": str(order_id)}  # привязка заказа
    }, uuid.uuid4().hex)

    return jsonify({"confirmation_url": payment.confirmation.confirmation_url}), 201


@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    # читаем тело и заголовок подписи
    raw_bytes = request.get_data()  # bytes body
    raw_body = raw_bytes.decode('utf-8', errors='replace')
    signature_header = (
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

    if not hmac.compare_digest(signature, expected):
        current_app.logger.error(f"Invalid signature. Got {signature!r}, expected {expected!r}")
        abort(400, "Invalid signature")

    # подпись верна, обрабатываем событие
    event = request.json or {}
    event_type = event.get('event')  # "payment.succeeded" и т.д.
    obj = event.get('object', {})
    payment_id = obj.get('id')
    order_id = obj.get('metadata', {}).get('order_id')

    current_app.logger.info(f"[Webhook] Событие {event_type} для платежа {payment_id}, заказ {order_id}")

    # TODO: ваша логика mark_order_paid(order_id)

    return "", 200
