from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
import os

app = Flask(__name__)
app.config.from_object(Config)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

CORS(app)
db.init_app(app)
jwt = JWTManager(app)

from routes.auth     import auth_bp
from routes.products import products_bp
from routes.orders   import orders_bp
from routes.admin    import admin_bp
from routes.reviews  import reviews_bp

app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(products_bp,  url_prefix='/api/products')
app.register_blueprint(orders_bp,    url_prefix='/api/orders')
app.register_blueprint(admin_bp,     url_prefix='/api/admin')
app.register_blueprint(reviews_bp,   url_prefix='/api/reviews')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def index():
    return {'message': 'E-commerce API is running!'}

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Tables ready!")
    app.run(debug=True)