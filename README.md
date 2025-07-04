# 🎫 EchoTix – Concert Booking Platform

**EchoTix** is a full-stack concert ticket booking platform that allows users to explore live music events, book tickets online, and receive digital passes with QR codes. This project was initially built using **EJS (server-rendered)** and later fully rebuilt using **React.js (client-side SPA)** for a more dynamic and responsive experience.

---

## 🧰 Versions Developed

| Version         | Frontend     | Backend | Deployment |
|----------------|--------------|---------|------------|
| ✅ V1 - EJS     | EJS + CSS    | Node.js + Express.js | Localhost |
| ✅ V2 - React   | React.js + Redux + CSS | Same backend (API only) | Client–Server architecture |

---

## 🚀 Features

### 👤 User Features
- Register and Login (JWT-based)
- Browse upcoming concerts with details
- Book up to 3 tickets per concert
- Razorpay payment integration
- Auto-generated Ticket ID + QR Code
- Download ticket PDF
- View, manage, and cancel bookings
- Review and rate concerts

### 🔐 Admin Features
- Admin dashboard login
- Create/edit/delete Bands, Artists, Concerts
- Upload artist and band images (Multer memory storage)
- View all users and bookings
- Cancel concerts (auto-cancels user tickets too)

---

## 🛠️ Tech Stack

### Frontend
- ✅ React.js (Latest)
- ✅ Redux Toolkit
- ✅ React Router DOM
- ✅ Normal CSS (No Bootstrap/Tailwind)
- ✅ EJS (Initial Version)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for Auth
- Multer for Image Uploads
- Razorpay for Payment
- html-pdf-node for Ticket PDF Generation
- qrcode for QR Generation

---

## ⚙️ Core Functionalities

- 🔐 JWT Auth (Login, Register)
- 📤 Image upload via Multer (memory storage)
- 💸 Secure Payment using Razorpay
- 📄 PDF Ticket with QR & Ticket ID
- ⚙️ Role-based Access (Admin/User)
- 📊 Review & Star Rating System
- 🔁 Version Migration: EJS to React

---

## 🎨 UI Snapshots

> Add screenshots here:

