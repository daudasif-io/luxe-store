from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Review, User, Product
from sqlalchemy import func

reviews_bp = Blueprint('reviews', __name__)

# ── GET REVIEWS FOR A PRODUCT ─────────────────────────────────
@reviews_bp.route('/<int:product_id>', methods=['GET'])
def get_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id)\
                          .order_by(Review.created_at.desc()).all()

    result = []
    for r in reviews:
        user = User.query.get(r.user_id)
        result.append({
            'id':         r.id,
            'rating':     r.rating,
            'comment':    r.comment,
            'user_name':  user.name if user else 'Deleted user',
            'created_at': str(r.created_at)
        })

    avg = db.session.query(func.avg(Review.rating))\
                    .filter_by(product_id=product_id).scalar()

    return jsonify({
        'reviews':    result,
        'avg_rating': round(float(avg), 1) if avg else 0,
        'count':      len(result)
    }), 200

# ── ADD REVIEW ────────────────────────────────────────────────
@reviews_bp.route('/<int:product_id>', methods=['POST'])
@jwt_required()
def add_review(product_id):
    user_id = get_jwt_identity()
    data    = request.get_json()
    rating  = data.get('rating')
    comment = data.get('comment', '').strip()

    if not rating or int(rating) not in [1,2,3,4,5]:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    existing = Review.query.filter_by(
        product_id=product_id, user_id=user_id
    ).first()

    if existing:
        return jsonify({'error': 'You have already reviewed this product'}), 409

    review = Review(
        product_id = product_id,
        user_id    = user_id,
        rating     = int(rating),
        comment    = comment
    )
    db.session.add(review)
    db.session.commit()

    user = User.query.get(user_id)
    return jsonify({
        'message':   'Review added',
        'id':        review.id,
        'rating':    review.rating,
        'comment':   review.comment,
        'user_name': user.name,
        'created_at': str(review.created_at)
    }), 201

# ── DELETE REVIEW (own review only) ──────────────────────────
@reviews_bp.route('/<int:review_id>/delete', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    user_id = get_jwt_identity()
    review  = Review.query.get_or_404(review_id)

    if str(review.user_id) != str(user_id):
        return jsonify({'error': 'You can only delete your own reviews'}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted'}), 200