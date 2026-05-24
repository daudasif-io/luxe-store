from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, Product, User

orders_bp = Blueprint('orders', __name__)

# ── PLACE ORDER ───────────────────────────────────────────────
@orders_bp.route('/', methods=['POST'])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    data    = request.get_json()
    items   = data.get('items', [])

    if not items:
        return jsonify({'error': 'Cart is empty'}), 400

    total = 0
    order = Order(user_id=user_id, total=0, status='pending')
    db.session.add(order)
    db.session.flush()

    for item in items:
        product = Product.query.get(item['id'])
        if not product:
            continue
        quantity  = int(item['quantity'])
        price     = float(product.price)
        total    += price * quantity

        order_item = OrderItem(
            order_id   = order.id,
            product_id = product.id,
            quantity   = quantity,
            price      = price
        )
        db.session.add(order_item)

    order.total = total
    db.session.commit()

    return jsonify({'message': 'Order placed successfully', 'order_id': order.id, 'total': total}), 201

# ── MY ORDER HISTORY ──────────────────────────────────────────
@orders_bp.route('/my', methods=['GET'])
@jwt_required()
def my_orders():
    user_id = get_jwt_identity()
    orders  = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

    result = []
    for o in orders:
        items = []
        for i in o.items:
            product = Product.query.get(i.product_id)
            items.append({
                'product_name': product.name if product else 'Deleted product',
                'quantity':     i.quantity,
                'price':        i.price
            })
        result.append({
            'id':         o.id,
            'total':      o.total,
            'status':     o.status,
            'created_at': str(o.created_at),
            'items':      items
        })

    return jsonify(result), 200

# ── ALL ORDERS — admin only ───────────────────────────────────
@orders_bp.route('/all', methods=['GET'])
@jwt_required()
def all_orders():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        buyer = User.query.get(o.user_id)
        result.append({
            'id':         o.id,
            'user':       buyer.name if buyer else 'Deleted user',
            'email':      buyer.email if buyer else '',
            'total':      o.total,
            'status':     o.status,
            'created_at': str(o.created_at),
            'item_count': len(o.items)
        })
    return jsonify(result), 200

# ── UPDATE ORDER STATUS — admin only ─────────────────────────
@orders_bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    order  = Order.query.get_or_404(order_id)
    data   = request.get_json()
    status = data.get('status')

    if status not in ['pending', 'processing', 'shipped', 'delivered', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400

    order.status = status
    db.session.commit()
    return jsonify({'message': 'Status updated'}), 200