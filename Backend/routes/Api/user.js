const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  authenticateJWT,
  isApiUser,
  isApiAdmin,
} = require("../../Middleware/apiauthentication");
const bcrypt = require("bcrypt");
const User = require("../../model/usermodel");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Testimonial = require("../../model/testimonalreview");
const Booking = require("../../model/bookingmodel");
const generateTicketPDF = require("../../utils/pdfgeneration");
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// User registration route
router.get("/login", (req, res) => {
  // You can send a response indicating no errors (e.g. initial load)
  res.json({ success: true, errors: [] });
});

router.post(
  "/register",
  upload.single("profileImage"),
  [
    body("username", "Username is required").notEmpty(),
    body("email", "Valid email required").isEmail(),
    body("password", "Minimum 8 characters").isLength({ min: 8 }),
    body("confirmPassword", "Passwords do not match").custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role: "user",
        profileImage: req.file
          ? {
              data: req.file.buffer,
              contentType: req.file.mimetype,
            }
          : undefined,
      });

      await newUser.save();
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.status(201).json({
        message: "User registered successfully",
        token,
        userId: newUser._id,
        role: newUser.role,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// profile
router.get("/profile", authenticateJWT, isApiUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let profileImage = null;
    if (user.profileImage?.data) {
      profileImage = {
        contentType: user.profileImage.contentType,
        data: user.profileImage.data.toString("base64"),
      };
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// user login route

router.post(
  "/login",
  [
    body("email", "Valid email required").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      const profileImageBase64 = user.profileImage.data.toString("base64");

      res.json({
        token,
        userId: user._id,
        role: user.role,
        name: user.username,
        email: user.email,
        profileImage: {
          contentType: user.profileImage.contentType,
          data: profileImageBase64,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// userreview
router.post(
  "/review",
  authenticateJWT,
  isApiUser,
  [body("review").trim().notEmpty().withMessage("Review field is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { review } = req.body;

    try {
      const testimonial = await Testimonial.create({
        user: req.user.userId,
        content: review,
        isApproved: false,
      });

      return res.status(201).json({
        success: true,
        testimonialid: testimonial._id,
        message: "Review submitted. Awaiting admin approval.",
      });
    } catch (error) {
      console.error("Error saving testimonial:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  }
);

// user profile update route

router.put(
  "/profile/:id",
  authenticateJWT,
  isApiUser,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      // password hashing
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        req.body.password = hashedPassword;
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { username, email, password: req.body.password },
        { new: true, runValidators: true }
      );

      if (req.file) {
        user.profileImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
        await user.save();
      }
      res.json({ user });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/tickets", authenticateJWT, isApiUser, async (req, res) => {
  try {
    const tickets = await Booking.find({ user: req.user.userId }) // assuming you're using JWT; change to `req.session.user._id` if sessions
      .populate("user")
      .populate({
        path: "concert",
        populate: { path: "band" },
      })
      .sort({ createdAt: -1 });

    const now = new Date();

    const upcomingTickets = [];
    const pastTickets = [];
    const cancelledTickets = [];

    for (const ticket of tickets) {
      const concertDate = new Date(ticket.concert.date);
      const bookingEndsAt = ticket.concert.bookingEndsAt
        ? new Date(ticket.concert.bookingEndsAt)
        : null;
      const bookingCreatedAt = new Date(ticket.createdAt);

      const diffInMs = now - bookingCreatedAt;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const canCancel =
        ticket.status === "completed" &&
        diffInHours <= 5 &&
        (!bookingEndsAt || now <= bookingEndsAt);

      // Attach flag to plain object (not Mongoose doc)
      const ticketData = {
        ...ticket.toObject(),
        canCancel,
      };

      if (
        ticket.status === "completed" &&
        ticket.concert.status === "upcoming" &&
        concertDate > now
      ) {
        upcomingTickets.push(ticketData);
      } else if (
        ticket.status === "completed" &&
        (ticket.concert.status === "past" || concertDate <= now)
      ) {
        pastTickets.push(ticketData);
      } else if (
        ticket.status === "cancelled_by_user" ||
        ticket.status === "cancelled_by_admin"
      ) {
        cancelledTickets.push(ticketData);
      }
    }

    return res.status(200).json({
      upcomingTickets,
      pastTickets,
      cancelledTickets,
    });
  } catch (error) {
    console.error("Error fetching user ticket history:", error);
    return res.status(500).json({ message: "Failed to fetch ticket history" });
  }
});

router.get(
  "/download/:id/pdf",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate("user")
        .populate({
          path: "concert",
          populate: { path: "band" },
        });

      if (!booking)
        return res.status(404).json({ message: "Booking not found" });

      // Optional: Check if the user requesting is the one who made the booking
      if (booking.user._id.toString() !== req.user.userId) {
        return res
          .status(403)
          .json({ message: "Access denied. Not your ticket." });
      }

      const pdfBuffer = await generateTicketPDF(booking);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${booking._id}.pdf"`,
      });
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error downloading ticket PDF:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;
