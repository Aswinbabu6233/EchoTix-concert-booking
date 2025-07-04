# 🎫 EchoTix - Concert Booking Application

EchoTix is a fully-featured online concert ticket booking platform where users can explore concerts, book tickets with integrated Razorpay payment, and receive unique ticket IDs with QR codes. Admins can manage concerts, artists, and bookings via a powerful dashboard. Built with Node.js, Express, MongoDB, and EJS, it offers a smooth experience for both users and administrators.

---

## 📌 Features

- ✅ User registration & login with JWT authentication  
- 🎵 Browse and filter concerts by band, artist, and date  
- 💳 Razorpay integration for secure online payments  
- 🎟️ Book tickets (limit 3 per user per concert) with unique ticket ID & QR code  
- 📄 PDF ticket generation and optional email delivery  
- 🧑‍💻 Admin panel to manage bands, artists, concerts, and bookings  
- 📊 Booking history & ticket management for users  
- 🔒 Auth middleware for user and admin roles  

---

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js  
- **Frontend:** EJS, HTML, CSS, JavaScript  
- **Database:** MongoDB (via Mongoose)  
- **Authentication:** JWT (JSON Web Tokens)  
- **Payments:** Razorpay  
- **Other:**  
  - QR code generation  
  - PDF creation (`html-pdf-node`)  
  - Emailing via `nodemailer` (optional)  

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Aswinbabu6233/EchoTix-concert-booking.git
cd EchoTix-concert-booking
