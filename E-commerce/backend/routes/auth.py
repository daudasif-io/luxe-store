from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from models import db, User
from flask import current_app
import bcrypt

auth_bp = Blueprint('auth', __name__)

def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

# ─── REGISTER ────────────────────────────────────────────────
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user = User(
        name     = name,
        email    = email,
        password = hashed.decode('utf-8')
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message' : 'Account created successfully',
        'token'   : token,
        'user'    : {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}
    }), 201

# ─── LOGIN ───────────────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message' : 'Login successful',
        'token'   : token,
        'user'    : {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}
    }), 200

# ─── FORGOT PASSWORD ─────────────────────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200

    s     = get_serializer()
    token = s.dumps(email, salt='password-reset')

    reset_url = f'http://localhost:5173/reset-password?token={token}'

    # Just print the link in terminal instead of sending email
    print(f'\n--- PASSWORD RESET LINK ---')
    print(f'User: {email}')
    print(f'Link: {reset_url}')
    print(f'---------------------------\n')

    return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200

# ─── RESET PASSWORD ──────────────────────────────────────────
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data        = request.get_json()
    token       = data.get('token', '')
    new_password = data.get('password', '')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    s = get_serializer()
    try:
        email = s.loads(token, salt='password-reset', max_age=1800)  # 30 minutes
    except SignatureExpired:
        return jsonify({'error': 'Reset link has expired'}), 400
    except BadSignature:
        return jsonify({'error': 'Invalid reset link'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    user.password = hashed.decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200

# ─── GET CURRENT USER (protected) ────────────────────────────
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id'    : user.id,
        'name'  : user.name,
        'email' : user.email,
        'role'  : user.role
    }), 200