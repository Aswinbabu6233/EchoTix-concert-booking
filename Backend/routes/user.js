const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcrypt");
const User = require("../model/usermodel");
const Concert = require("../model/concertmodel");
const { isAuthenticated } = require("../Middleware/authentication");
const Booking = require("../model/bookingmodel");
const pdfticketgenerator = require("../utils/pdfgeneration");
const ActivityLog = require("../model/activitylogmodel");
const Testimonial = require("../model/testimonalreview");

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// getuser register page

router.get("/register", (req, res) => {
  res.render("common/register", { errors: [] });
});

router.post(
  "/newaccount",
  upload.single("profilephoto"),
  [
    // validation code here
    body("username").notEmpty().withMessage("Username is required"),
    body("email").notEmpty().isEmail().withMessage("Invalid Email"),
    body("password")
      .notEmpty()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("common/register", { errors: errors.array() });
    }
    const { email } = req.body;
    const existUser = await User.find({ email });
    if (existUser.length > 0) {
      return res.render("common/register", {
        errors: [{ msg: "Email already exists" }],
      });
    }
    const { username } = req.body;
    const existUsername = await User.find({ username });
    if (existUsername.length > 0) {
      return res.render("common/register", {
        errors: [{ msg: "Username already exists" }],
      });
    }

    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newuser = new User({
        username: username.trim(),
        email: email.trim(),
        password: hashedPassword,
        profileImage: req.file
          ? {
              data: req.file.buffer,
              contentType: req.file.mimetype,
            }
          : undefined,
      });
      await newuser.save();
      req.session.user = {
        _id: newuser._id,
        role: newuser.role,
        username: newuser.username,
      }; // log activity
      await ActivityLog.create({
        actionType: "user_registered",
        message: `User registered with username: ${username}`,
        icon: "fa-user",
      });

      res.redirect("/");
    } catch (error) {
      console.error("Registration error:", error);
      res.render("common/register", {
        errors: [{ msg: "Server error occured while registering" }],
      });
    }
  }
);

router.get("/login", (req, res) => {
  res.render("common/login", { errors: [] });
});

router.post(
  "/Login",
  [
    body("email").isEmail().withMessage("Valid Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("common/login", { errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, role: "user" });
      if (!user) {
        return res.render("common/login", {
          errors: [{ msg: "User not found or invalid email" }],
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render("common/login", {
          errors: [{ msg: "Incorrect password" }],
        });
      }
      req.session.user = {
        _id: user._id,
        role: user.role,
        username: user.username,
      };
      res.redirect("/");
    } catch (err) {
      console.error("Login error:", err);
      res.render("common/login", {
        errors: [{ msg: "Server error. Please try again later." }],
      });
    } finally {
      req.session.save();
    }
  }
);

// profile
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("user/profile", { user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Server Error");
  }
});

// edit profile
router.get("/edit/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.render("user/editprofile", { user, errors: [] });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Server Error");
  }
});
router.post(
  "/edit/:id",
  isAuthenticated,
  upload.single("profileImage"),
  [
    body("password")
      .optional({ checkFalsy: true }) // allow empty or falsy values
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const user = await User.findById(req.params.id);
      return res.render("user/editprofile", {
        user,
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findById(req.params.id);

      user.username = name.trim();
      user.email = email.trim().toLowerCase();

      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      if (req.file) {
        user.profileImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      await user.save();
      req.flash("success_msg", "Profile updated successfully");
      res.redirect("/user/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      req.flash("error_msg", "Something went wrong");
      res.redirect("/user/edit/profile");
    }
  }
);

// show user ticket history
router.get("/tickets", isAuthenticated, async (req, res) => {
  try {
    const tickets = await Booking.find({ user: req.session.user._id })
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

      // attach flag
      ticket.canCancel = canCancel;

      if (
        ticket.status === "completed" &&
        ticket.concert.status === "upcoming" &&
        concertDate > now
      ) {
        upcomingTickets.push(ticket);
      } else if (
        ticket.status === "completed" &&
        (ticket.concert.status === "past" || concertDate <= now)
      ) {
        pastTickets.push(ticket);
      } else if (
        ticket.status === "cancelled_by_user" ||
        ticket.status === "cancelled_by_admin"
      ) {
        cancelledTickets.push(ticket);
      }
    }

    res.render("user/tickets", {
      upcomingTickets,
      pastTickets,
      cancelledTickets,
    });
  } catch (error) {
    console.error("Error fetching user ticket history:", error);
    res.status(500).send("Server Error");
  }
});

// cancel ticket
router.post("/cancel/:id", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("concert");

    // Check if booking exists and belongs to the user
    if (
      !booking ||
      booking.user.toString() !== req.session.user._id.toString()
    ) {
      return res.status(403).send("Unauthorized");
    }

    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const hoursSinceBooking = (now - bookingCreatedAt) / (1000 * 60 * 60);
    const bookingEndsAt = booking.concert.bookingEndsAt;

    // Cancel only within 5 hours and before booking end
    if (
      hoursSinceBooking > 5 ||
      (bookingEndsAt && now > new Date(bookingEndsAt))
    ) {
      return res.status(400).send("Cannot cancel ticket. Time window expired.");
    }

    // Update booking
    booking.status = "cancelled_by_user";
    booking.cancelledAt = now;
    booking.cancelReason = "Cancelled by user";
    await booking.save();

    // Refetch concert and update ticketsAvailable
    const concert = await Concert.findById(booking.concert._id);
    concert.ticketsAvailable += booking.ticketQuantity;
    await concert.save();

    //log activity
    await ActivityLog.create({
      actionType: "user_cancelled_ticket",
      message: `User cancelled ticket for concert: ${concert.title}`,
      icon: "fa-trash",
    });

    res.redirect("/user/tickets");
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).send("Server Error");
  }
});

// download ticket pdf

router.get("/download/:id/pdf", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate({
        path: "concert",
        populate: { path: "band" },
      });
    if (!booking) return res.status(404).send("Booking not found");

    const pdfBuffer = await pdfticketgenerator(booking);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${booking._id}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading ticket PDF:", error);
    res.status(500).send("Server Error");
  }
});

// review route
router.post(
  "/review",
  isAuthenticated,
  [body("review").trim().notEmpty().withMessage("Review field is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { review } = req.body;

    try {
      const testimonial = new Testimonial({
        user: req.session.user._id, // assuming session-based auth
        content: review,
        isApproved: false, // admin needs to approve first
      });

      await testimonial.save();
      req.flash(
        "success_msg",
        "Testimonial submitted. Admin will review it soon."
      );
      res.redirect("/user/profile");
    } catch (error) {
      console.error("Error saving testimonial:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  }
);

// logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

module.exports = router;
