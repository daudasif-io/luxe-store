from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Product, Order, OrderItem
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def check_admin():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    return user if user and user.role == 'admin' else None

# ── DASHBOARD STATS ───────────────────────────────────────────
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403

    total_revenue  = db.session.query(func.sum(Order.total)).scalar() or 0
    total_orders   = Order.query.count()
    total_users    = User.query.count()
    total_products = Product.query.count()

    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    recent = []
    for o in recent_orders:
        user = User.query.get(o.user_id)
        recent.append({
            'id':         o.id,
            'user':       user.name if user else 'Deleted',
            'total':      o.total,
            'status':     o.status,
            'created_at': str(o.created_at)
        })

    orders_by_status = db.session.query(
        Order.status, func.count(Order.id)
    ).group_by(Order.status).all()
    status_data = [{'status': s, 'count': c} for s, c in orders_by_status]

    return jsonify({
        'total_revenue':  round(float(total_revenue), 2),
        'total_orders':   total_orders,
        'total_users':    total_users,
        'total_products': total_products,
        'recent_orders':  recent,
        'status_data':    status_data,
    }), 200

# ── ALL ORDERS ────────────────────────────────────────────────
@admin_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_orders():
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    result = []
    for o in orders:
        user = User.query.get(o.user_id)
        result.append({
            'id':         o.id,
            'user':       user.name  if user else 'Deleted',
            'email':      user.email if user else '',
            'total':      o.total,
            'status':     o.status,
            'created_at': str(o.created_at),
            'item_count': len(o.items)
        })
    return jsonify(result), 200

# ── UPDATE ORDER STATUS ───────────────────────────────────────
@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    from flask import request
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403

    order  = Order.query.get_or_404(order_id)
    data   = request.get_json()
    status = data.get('status')

    valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if status not in valid:
        return jsonify({'error': 'Invalid status'}), 400

    order.status = status
    db.session.commit()
    return jsonify({'message': 'Status updated'}), 200

# ── ALL USERS ─────────────────────────────────────────────────
@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    if not check_admin():
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([{
        'id':         u.id,
        'name':       u.name,
        'email':      u.email,
        'role':       u.role,
        'created_at': str(u.created_at)
    } for u in users]), 200