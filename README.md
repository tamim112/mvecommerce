# Multi-Vendor E-Commerce Platform (BazarHub)

A full-stack, mobile-responsive Multi-Vendor E-Commerce application built with **Django REST Framework (Backend)** and **React.js + Tailwind CSS (Frontend)**. It features separate customer/vendor flows, dynamic cart/checkout systems, and custom JWT authentication.

---

## 🛠️ New System Installation & Run Process

Follow these steps to set up and run the project on a new machine:

### 1. Clone the Project
```bash
git clone <YOUR_GITHUB_REPOSITORY_LINK>
cd multivendor_ecommerce
```

### 2. Backend Setup (Django)
Open a terminal in the root directory and run:
```bash
# Create a virtual environment
python -m venv venv

# Activate Virtual Environment
# For Windows:
venv\Scripts\activate
# For Mac/Linux:
source venv/bin/activate

# Install required Python packages
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Create an Admin/Superuser account
python manage.py createsuperuser

# Start the Django Backend Server
python manage.py runserver
```
*The backend API will be live at `http://127.0.0`*

### 3. Frontend Setup (React)
Open a **new terminal window** inside the `frontend` folder and run:
```bash
cd frontend

# Install Node modules
npm install

# Start the React Dev Server
npm run dev
```
*The frontend web app will be live at `http://localhost:5173/`*

---

## 📌 Project Architecture
- **Authentication**: JWT Token based Sign-up and Login (`/api/accounts/`)
- **Store & Inventory**: Dynamic Products & Categories API (`/api/store/`)
- **Cart & Orders**: Core ordering logic and state tracking (`/api/orders/`)
