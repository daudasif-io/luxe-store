from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Product, User
from werkzeug.utils import secure_filename
from sqlalchemy import func
from models import db, Product, User, Review
import os, uuid

products_bp = Blueprint('products', __name__)

def is_admin():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    return user and user.role == 'admin'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_image(file):
    if file and allowed_file(file.filename):
        ext      = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        path     = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        return f"/uploads/{filename}"
    return None

# ── GET ALL PRODUCTS ──────────────────────────────────────────
@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.order_by(Product.created_at.desc()).all()
    result = []
    for p in products:
        avg = db.session.query(func.avg(Review.rating))\
                        .filter_by(product_id=p.id).scalar()
        count = Review.query.filter_by(product_id=p.id).count()
        result.append({
            'id':          p.id,
            'name':        p.name,
            'description': p.description,
            'price':       p.price,
            'stock':       p.stock,
            'image_url':   p.image_url,
            'created_at':  str(p.created_at),
            'avg_rating':  round(float(avg), 1) if avg else 0,
            'review_count': count
        })
    return jsonify(result), 200

# ── GET SINGLE PRODUCT ────────────────────────────────────────
@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    p = Product.query.get_or_404(product_id)
    return jsonify({
        'id':          p.id,
        'name':        p.name,
        'description': p.description,
        'price':       p.price,
        'stock':       p.stock,
        'image_url':   p.image_url,
        'created_at':  str(p.created_at)
    }), 200

# ── ADD PRODUCT ───────────────────────────────────────────────
@products_bp.route('/', methods=['POST'])
@jwt_required()
def add_product():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    name  = request.form.get('name', '').strip()
    price = request.form.get('price')

    if not name or price is None:
        return jsonify({'error': 'Name and price are required'}), 400

    image_url = None
    if 'image' in request.files:
        image_url = save_image(request.files['image'])

    if not image_url:
        image_url = request.form.get('image_url', '')

    product = Product(
        name        = name,
        description = request.form.get('description', ''),
        price       = float(price),
        stock       = int(request.form.get('stock', 0)),
        image_url   = image_url
    )
    db.session.add(product)
    db.session.commit()

    return jsonify({'message': 'Product added', 'id': product.id}), 201

# ── EDIT PRODUCT ──────────────────────────────────────────────
@products_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def edit_product(product_id):
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    p = Product.query.get_or_404(product_id)

    if request.content_type and 'multipart' in request.content_type:
        p.name        = request.form.get('name',        p.name)
        p.description = request.form.get('description', p.description)
        p.price       = float(request.form.get('price', p.price))
        p.stock       = int(request.form.get('stock',   p.stock))

        if 'image' in request.files and request.files['image'].filename:
            new_url = save_image(request.files['image'])
            if new_url:
                if p.image_url and p.image_url.startswith('/uploads/'):
                    old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], p.image_url.split('/')[-1])
                    if os.path.exists(old_path):
                        os.remove(old_path)
                p.image_url = new_url
    else:
        data          = request.get_json()
        p.name        = data.get('name',        p.name)
        p.description = data.get('description', p.description)
        p.price       = float(data.get('price', p.price))
        p.stock       = int(data.get('stock',   p.stock))
        p.image_url   = data.get('image_url',   p.image_url)

    db.session.commit()
    return jsonify({'message': 'Product updated'}), 200

# ── DELETE PRODUCT ────────────────────────────────────────────
@products_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    p = Product.query.get_or_404(product_id)

    if p.image_url and p.image_url.startswith('/uploads/'):
        old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], p.image_url.split('/')[-1])
        if os.path.exists(old_path):
            os.remove(old_path)

    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Product deleted'}), 200