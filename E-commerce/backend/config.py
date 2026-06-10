import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://postgres:luxestore2026@db.qpbenyqktzuawzacajbe.supabase.co:5432/postgres')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY     = os.environ.get('SECRET_KEY', 'your-super-secret-key-change-this')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key-change-this')

    UPLOAD_FOLDER  = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}