# 🎫 EchoTix - Concert Booking Application (React + Node.js)

**EchoTix** is a full-stack concert ticket booking platform that allows users to explore concerts, securely book tickets, and receive QR-coded digital tickets. It features a user-friendly interface for customers and a powerful admin dashboard for managing bands, artists, concerts, and bookings.

---

## 🌐 Live Demo

👉 [https://echotix.example.com](https://echotix.example.com) _(Update with real link if hosted)_

---

## 📸 Preview

> _(Add screenshots or screen recordings of the UI here)_

---

## ✨ Key Features

### 👤 User Features

- 🔐 JWT-based Register/Login system
- 🎵 Browse concerts by band, artist, or date
- 📅 Detailed concert pages with artist & band info
- 🎟️ Book up to 3 tickets per concert
- 💳 Razorpay payment integration
- 📄 Get tickets with unique ID, QR Code, and downloadable PDF
- 📁 Booking history and ticket management

### 🛠 Admin Features

- 🧑‍💻 Secure Admin login with protected routes
- 🎤 Create, edit, and delete bands, artists, and concerts
- 📋 View and manage all bookings
- ❌ Cancel concerts (auto-updates associated tickets)

---

## 🧑‍💻 Tech Stack

| Layer            | Tech Used                                  |
| ---------------- | ------------------------------------------ |
| Frontend         | React.js, Redux Toolkit, React Router, CSS |
| Backend          | Node.js, Express.js                        |
| Database         | MongoDB with Mongoose                      |
| Authentication   | JWT (JSON Web Tokens)                      |
| Payments         | Razorpay                                   |
| PDF & QR         | html-pdf-node, qrcode                      |
| Email (Optional) | nodemailer                                 |

---

## 📂 Project Structure

echotix/
├── backend/
│ ├── config/
│ │ └── db.js
│ ├── controllers/
│ │ ├── adminController.js
│ │ ├── authController.js
│ │ ├── bookingController.js
│ │ └── concertController.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ └── errorMiddleware.js
│ ├── models/
│ │ ├── User.js
│ │ ├── Band.js
│ │ ├── Concert.js
│ │ ├── Booking.js
│ │ └── Review.js
│ ├── routes/
│ │ ├── adminRoutes.js
│ │ ├── authRoutes.js
│ │ ├── userRoutes.js
│ │ └── concertRoutes.js
│ ├── utils/
│ │ ├── sendEmail.js
│ │ └── generateQR.js
│ └── server.js
│
├── frontend/
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ │ ├── Navbar.jsx
│ │ │ ├── Footer.jsx
│ │ │ ├── BookingCard.jsx
│ │ │ └── ConcertCard.jsx
│ │ ├── pages/
│ │ │ ├── Home.jsx
│ │ │ ├── Concerts.jsx
│ │ │ ├── Profile.jsx
│ │ │ └── AdminDashboard.jsx
│ │ ├── redux/
│ │ │ ├── store.js
│ │ │ └── slices/
│ │ │ ├── authSlice.js
│ │ │ ├── concertSlice.js
│ │ │ └── bookingSlice.js
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css
│
├── README.md
├── .gitignore
├── package.json
└── LICENSE
