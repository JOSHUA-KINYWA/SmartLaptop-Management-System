"# Smart Laptop Management System

A full-stack web application for managing laptop inventory, student laptop applications, admin approvals, notifications, and M-Pesa payment flows.

## Overview

This project includes:

- Student and admin authentication
- Laptop inventory management
- Laptop application and approval workflow
- Dashboard analytics
- Password reset functionality
- Email notifications
- M-Pesa Daraja STK Push integration
- Modern React frontend with Vite
- Express REST API backend

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Charting and dashboard UI libraries

Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- Nodemailer
- Socket.IO
- Daraja M-Pesa integration

## Project Structure

```bash
lab-main/
├── backend/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── README.md
└── .gitignore
```

## Prerequisites

Before running the app, ensure you have:

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB connection string
- A Gmail account for SMTP emails (optional but recommended)
- Safaricom Daraja credentials for M-Pesa integration (optional for payment flow)

## Local Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Create a backend environment file

Create a file named `.env` inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lab-system
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=http://localhost:5000/api/mpesa/callback
```

> Keep your `.env` file private and never commit real secrets to Git.

### 3. Start MongoDB

Make sure MongoDB is running locally on:

```bash
mongodb://127.0.0.1:27017
```

### 4. Run the backend server

```bash
cd backend
npm start
```

The backend will run at:

```bash
http://localhost:5000
```

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Run the frontend app

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

The frontend will run at:

```bash
http://localhost:5173
```

## Available Routes

### Auth API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Laptop API

- `GET /api/laptops`
- `POST /api/laptops`
- `PUT /api/laptops/:id`
- `DELETE /api/laptops/:id`

### Applications

- `GET /api/applications`
- `POST /api/applications`

### M-Pesa API

- `POST /api/mpesa/initiate`
- `POST /api/mpesa/callback`
- `GET /api/mpesa/status`

## Default App Flow

1. Register a student or admin account.
2. Log in to the system.
3. Admin adds laptops to inventory.
4. Students browse and apply for laptops.
5. Admin reviews and approves laptop applications.
6. M-Pesa can be used for payment-related workflows when Daraja credentials are configured.

## Production Notes

- Use a secure `JWT_SECRET` in production.
- Replace `localhost` M-Pesa callback URLs with a public HTTPS URL when testing against Safaricom sandbox or live credentials.
- Use a real Gmail app password or another valid SMTP provider for email delivery.
- For deployment, build the frontend and serve the generated files or configure a reverse proxy.

## Common Commands

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
npm run build
```

## License

This project is intended for academic or internal institutional use unless otherwise specified by the owner.

## Support

For setup assistance, confirm:

- MongoDB is running
- the `.env` file exists in `backend`
- the frontend is pointing to the correct backend URL
- M-Pesa credentials are valid if testing payments
" 
