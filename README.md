# 🛍️ Luxe Store — Full Stack E-Commerce Application

A complete, production-ready e-commerce web application built from scratch by a developer.

![Tech Stack](https://img.shields.io/badge/Frontend-React-blue)
![Tech Stack](https://img.shields.io/badge/Backend-Flask-green)
![Tech Stack](https://img.shields.io/badge/Database-MySQL-orange)

---

## 👨‍💻 Built By
**Daud Asif** | Full Stack Developer  
Certified By PNY Trainings

---

## 🚀 Features

### Customer Features
- Register and login with secure JWT authentication
- Browse all products with search, filter, sort and pagination
- View full product detail page
- Add products to cart with quantity control
- 3-step checkout with live credit card preview
- View order history with status tracking
- Leave star ratings and written reviews on products

### Admin Features
- Add, edit and delete products with drag and drop image upload
- Admin dashboard with revenue, orders, users and product statistics
- Recharts bar chart showing orders by status
- View and manage all orders — update status (pending/processing/shipped/delivered)
- View all registered users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS (Vite) + React Router + Axios |
| Backend | Flask (Python) + SQLAlchemy + JWT |
| Database | MySQL via XAMPP |
| Charts | Recharts |
| Auth | Flask-JWT-Extended + bcrypt |
| File Upload | Flask file handling + FormData |
| Cart | React Context API |
| Fonts | Cormorant Garamond + Outfit |

---

## 📁 Project Structure
luxe-store/
|── E-commerce/
    ├── backend/
    │   ├── app.py              # Flask app entry point
    │   ├── config.py           # Database and app config
    │   ├── models.py           # SQLAlchemy models (User, Product, Order, Review)
    │   ├── routes/
    │   │   ├── auth.py         # Register, login, forgot/reset password
    │   │   ├── products.py     # Product CRUD with image upload
    │   │   ├── orders.py       # Place order, order history
    │   │   ├── admin.py        # Admin stats, all orders, all users
    │   │   └── reviews.py      # Add, get, delete reviews
    │   └── uploads/            # Uploaded product images
    └── frontend/
    └── src/
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Products.jsx
    │   ├── ProductDetails.jsx
    │   ├── Cart.jsx
    │   ├── Checkout.jsx
    │   ├── Orders.jsx
    │   ├── AdminProducts.jsx
    │   └── AdminDashboard.jsx
    ├── context/
    │   └── CartContext.jsx
    └── index.css

---

## ⚙️ How to Run Locally

### Prerequisites
- Python 3.x
- Node.js
- XAMPP (for MySQL)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql bcrypt itsdangerous
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Start XAMPP and run MySQL
2. Open `http://localhost/phpmyadmin`
3. Create a database called `ecommerce_db`
4. Flask will auto-create all tables on first run

### Make yourself admin
After registering, run this in phpMyAdmin SQL tab:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 🔐 Security Features
- Passwords hashed with bcrypt (never stored as plain text)
- JWT tokens for session management
- Admin-only routes protected with role checking
- Password reset tokens expire after 30 minutes
- SQL injection prevented by SQLAlchemy ORM

---

## 📸 Key Pages
- **Home** — Dark luxury landing page with hero section and features
- **Products** — Grid layout with search, filters and pagination
- **Product Detail** — Full page with reviews and ratings
- **Cart** — Item management with quantity controls
- **Checkout** — 3-step flow with live card preview
- **Admin Dashboard** — Stats, charts, orders and user management

---

## 🎯 What I Learned Building This
- How frontend and backend communicate through REST APIs
- JWT authentication and secure password storage
- Database design with foreign key relationships
- React state management with Context API
- File upload handling in Flask
- Building admin systems with role-based access control
- Debugging real errors in a full stack environment

---

*This project was built as a learning exercise and portfolio piece.*  
*Every line of code was written and debugged personally.*
