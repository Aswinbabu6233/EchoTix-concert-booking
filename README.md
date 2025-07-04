# 🎫 EchoTix - Concert Booking Application (React + Node.js)

**EchoTix** is a full-stack concert ticket booking platform that allows users to explore concerts, securely book tickets, and receive QR-coded digital tickets. It features a user-friendly interface for customers and a powerful admin dashboard for managing bands, artists, concerts, and bookings.

---

## 🌐 Live Demo

👉 [https://echotix.example.com](https://echotix.example.com) *(Update with real link if hosted)*

---

## 📸 Preview

> *(Add screenshots or screen recordings of the UI here)*

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

| Layer        | Tech Used                               |
|--------------|------------------------------------------|
| Frontend     | React.js, Redux Toolkit, React Router, CSS |
| Backend      | Node.js, Express.js                      |
| Database     | MongoDB with Mongoose                    |
| Authentication | JWT (JSON Web Tokens)                |
| Payments     | Razorpay                                 |
| PDF & QR     | html-pdf-node, qrcode                    |
| Email (Optional) | nodemailer                         |

---

## 📂 Project Structure

EchoTix-concert-booking/
├── Backend/                         # Node.js + Express backend
│   ├── bin/                         # Server start script
│   ├── database/                    # MongoDB connection config
│   ├── Middleware/                 # Authentication & error middlewares
│   ├── model/                       # Mongoose schemas (User, Band, Concert, etc.)
│   ├── public/                      # Public/static files
│   ├── routes/                      # All backend routes
│   ├── utils/                       # QR code, PDF, email helpers
│   ├── views/                       # EJS views (from older version)
│   ├── .env                         # Backend environment variables
│   ├── app.js                       # Express entry point
│   └── package.json
│
├── Frontend/                        # React + Redux frontend
│   ├── public/                      # HTML & static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, Lottie JSON
│   │   ├── Components/
│   │   │   ├── concertcard/         # Concert card components
│   │   │   ├── Loading/             # Loading animation/component
│   │   │   ├── NavBar/              # Navigation bar
│   │   │   └── redux/               # Redux store and slices
│   │   ├── pages/                   # Route pages: Home, Login, Signup, etc.
│   │   │   ├── artistlist.jsx
│   │   │   ├── concertlist.jsx
│   │   │   ├── homepage.jsx
│   │   │   ├── Loginpage.jsx
│   │   │   └── Signup.jsx
│   │   ├── styles/                  # Plain CSS styling
│   │   │   ├── commonstyles.css
│   │   │   └── teststyle.css
│   │   ├── main.jsx                 # React entry file
│   │   └── route.jsx                # React Router config
│   ├── .env                         # Frontend environment variables
│   ├── package.json
│   └── index.html
│
├── README.md                        # Project documentation
