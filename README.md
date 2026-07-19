# 🛍️ Luxe Store — Full Stack E-Commerce Platform

**Production-ready e-commerce app with React frontend, Python Flask backend, MySQL database, and JWT authentication**

[![Live Demo](https://img.shields.io/badge/▲-LIVE%20DEMO-black?style=for-the-badge)](https://luxe-store-seven-ruddy.vercel.app)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)

---

## Overview

A complete e-commerce platform built from scratch — not a template, not a tutorial clone. Features full product management, user authentication, a working cart system, an admin dashboard with analytics, and a 3-step checkout flow. Cross-stack project proving full-stack capability across JavaScript frontend and Python backend.

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|---|---|
| Python Flask | REST API server |
| MySQL | Relational database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| SQLAlchemy | ORM and query builder |

### Deployment
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting |
| Docker | Backend containerization |

## Features

### Storefront
- Product listing with category filtering and search
- Product detail pages with image gallery
- Add to cart with quantity management
- Persistent cart across sessions

### Authentication
- User registration and login with JWT
- Protected routes for checkout and account
- Admin role with elevated permissions

### Admin Dashboard
- Product management — add, edit, delete
- Order management with status updates
- Sales analytics and revenue tracking
- User management

### Checkout
- 3-step checkout flow
- Order summary with itemized pricing
- Order confirmation and history

## Getting Started

### Frontend
```bash
cd E-commerce/frontend
npm install
npm run dev
```

### Backend
```bash
cd E-commerce/backend
pip install -r requirements.txt
python app.py
```

### Environment Variables
```env
DATABASE_URL="mysql://user:password@localhost:3306/luxestore"
JWT_SECRET="your-secret-key"
```

## License
MIT
