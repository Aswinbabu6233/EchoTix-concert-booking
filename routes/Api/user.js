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
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

// User registration route
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
        { expiresIn: "1h" }
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
        { expiresIn: "1h" }
      );

      res.json({ token, userId: user._id, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
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

module.exports = router;
