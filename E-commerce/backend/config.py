import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/ecommerce_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY     = 'your-super-secret-key-change-this'
    JWT_SECRET_KEY = 'your-jwt-secret-key-change-this'

    UPLOAD_FOLDER  = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}