const express = require("express");
const router = express.Router();
const {
  authenticateJWT,
  isApiUser,
  isApiAdmin,
} = require("../../Middleware/apiauthentication");
const User = require("../../model/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Band = require("../../model/bandmodel");
const Concert = require("../../model/concertmodel");
const multer = require("multer");
const Booking = require("../../model/bookingmodel");
const Artist = require("../../model/artistmodel");
const ActivityLog = require("../../model/activitylogmodel");
const { body, validationResult } = require("express-validator");
const { isAdmin } = require("../../Middleware/authentication");
const Testimonial = require("../../model/testimonalreview");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email, role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//dashboard
router.get("/dashboard", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    const admin = await User.findById(req.user._id);
    const now = new Date();
    const upcomingConcerts = await Concert.find({ date: { $gte: now } })
      .populate("band")
      .sort({ date: 1 })
      .lean();

    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .lean();
    const bands = await Band.find({}).sort({ createdAt: -1 }).lean();
    const artists = await Artist.find({})
      .populate("band", "name")
      .sort({ createdAt: -1 })
      .lean();
    const concerts = await Concert.find({})
      .populate("band")
      .sort({ createdAt: -1 })
      .lean();
    const bookings = await Booking.find({ status: "completed" }).lean();

    const showusers = users.slice(0, 5);
    const showbands = bands.slice(0, 5);
    const showartists = artists.slice(0, 5);
    const showconcerts = concerts.slice(0, 5);

    const recentActivities = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      showbands,
      showartists,
      showconcerts,
      showusers,
      upcomingConcerts,
      admin,
      users,
      bands,
      artists,
      concerts,
      revenue,
      bookings,
      recentActivities,
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// bandmanagement
router.get("/bands", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const bands = await Band.find({}).sort({ createdAt: -1 }).lean();
    res.json({ bands });
  } catch (error) {
    console.error("Error loading bands:", error);
    res.status(500).send("Server Error");
  }
});

// band upload
router.post(
  "/create/bandsubmit",
  authenticateJWT,
  isApiAdmin,
  upload.single("bandimg"),
  [
    body("bandname").notEmpty().withMessage("Band Name is required"),
    body("banddiscription")
      .notEmpty()
      .withMessage("Band description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: "Band image is required" }],
      });
    }

    try {
      const { bandname, banddiscription } = req.body;

      const band = new Band({
        name: bandname.trim(),
        discription: banddiscription.trim(),
        image: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      await band.save();

      await ActivityLog.create({
        actionType: "band_added",
        message: `New band "${band.name}" added`,
        icon: "fa-headphones",
      });

      res.status(201).json({
        message: "Band successfully uploaded",
        bandId: band._id,
      });
    } catch (error) {
      console.error("Error while saving band details:", error);
      res.status(500).json({
        errors: [{ msg: "An error occurred while saving the band data" }],
      });
    }
  }
);

// artistmanagement

router.get("/artists", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const artists = await Artist.find({})
      .populate("band") // populate only the 'name' field of the band
      .sort({ createdAt: -1 })
      .lean();
    res.status(202).json({ artists });
  } catch (error) {
    console.error("Error loading artists:", error);
    res.status(500).send("Server Error");
  }
});

// artist upload
router.post(
  "/create/artistsubmit",
  authenticateJWT,
  isApiAdmin,
  upload.single("artistimg"),
  [
    body("artistname").notEmpty().withMessage("Artist Name is required"),
    body("artistdiscription")
      .notEmpty()
      .withMessage("Artist description is required"),
    body("band").notEmpty().withMessage("Band is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        errors: [{ msg: "Artist image is required" }],
      });
    }

    try {
      const { artistname, artistdiscription, band } = req.body;

      const artist = new Artist({
        name: artistname.trim(),
        description: artistdiscription.trim(),
        band: band.trim(),
        photo: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
      });

      await artist.save();

      await ActivityLog.create({
        actionType: "artist_added",
        message: `New artist "${artist.name}" added`,
        icon: "fa-user",
      });

      res.status(201).json({
        message: "Artist successfully uploaded",
        artistId: artist._id,
      });
    } catch (error) {
      console.error("Error while saving artist details:", error);
      res.status(500).json({
        errors: [{ msg: "An error occurred while saving the artist data" }],
      });
    }
  }
);

// concert management
router.get("/concerts", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const concerts = await Concert.find({})
      .populate("band")
      .sort({ createdAt: -1 })
      .lean();
    res.status(202).json({ concerts });
  } catch (error) {
    console.error("Error loading concerts:", error);
    res.status(500).send("Server Error");
  }
});

// concert creation
router.get(
  "/create/concerts",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const bands = await Band.find({});
      res.status(202).json({ bands });
    } catch (err) {
      console.error(err);
      res.render("Admin/Addconcert", {
        bands: [],
        errors: [{ msg: "Failed to load bands." }],
      });
    }
  }
);

// concert creation post

router.post(
  "/concerts",
  authenticateJWT,
  isApiAdmin,
  upload.single("concertImage"),
  [
    body("title").notEmpty().trim().withMessage("Concert title is required"),
    body("description")
      .notEmpty()
      .trim()
      .withMessage("Description is required"),
    body("date").notEmpty().withMessage("Concert date is required"),
    body("time").notEmpty().trim().withMessage("Start time is required"),
    body("duration")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Duration must be a number (min 1)"),
    body("city").notEmpty().trim().withMessage("City is required"),
    body("venue").notEmpty().trim().withMessage("Venue is required"),
    body("locationMapUrl")
      .optional({ checkFalsy: true })
      .trim()
      .isURL()
      .withMessage("Invalid Map URL"),
    body("ticketPrice")
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Valid ticket price is required"),
    body("totalTickets")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Total tickets must be at least 1"),
    body("ticketsAvailable")
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Tickets available must be 0 or more"),
    body("band").notEmpty().trim().withMessage("Band is required"),
    body("tags").optional().trim(),
    body("bookingEndsAt")
      .optional()
      .trim()
      .isISO8601()
      .withMessage("Invalid booking end time"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title = "",
        description = "",
        date,
        time,
        duration,
        city = "",
        venue = "",
        locationMapUrl = "",
        ticketPrice,
        totalTickets,
        ticketsAvailable,
        bookingEndsAt,
        tags = "",
        band,
      } = req.body;

      const concert = new Concert({
        title: title.trim(),
        description: description.trim(),
        date: new Date(date),
        time: time.trim(),
        duration: parseInt(duration),
        city: city.trim().toLowerCase(),
        venue: venue.trim(),
        locationMapUrl: locationMapUrl.trim(),
        ticketPrice: parseFloat(ticketPrice),
        totalTickets: parseInt(totalTickets),
        ticketsAvailable: parseInt(ticketsAvailable),
        bookingEndsAt: bookingEndsAt ? new Date(bookingEndsAt) : null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        band: band.trim(),
      });

      if (req.file) {
        concert.concertImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      await concert.save();

      const bandDoc = await Band.findById(band);

      // log activity

      await ActivityLog.create({
        actionType: "concert_added",
        message: `New concert "${concert.title}" added to band "${bandDoc.name}"`,
        icon: "fa-calendar-plus",
      });
      res.status(201).json({
        message: "Concert successfully created",
        concertId: concert._id,
      });
    } catch (error) {
      console.error("Concert creation error:", error);
      res.status(500).json({
        errors: [{ msg: "An error occurred while creating the concert" }],
      });
    }
  }
);

// edit section

// artist edit
router.get(
  "/edit/artist/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const artist = await Artist.findById(req.params.id).populate("band");
      const bands = await Band.find({});
      if (!artist) {
        return res.status(404).send("Artist not found");
      }
      res.status(200).json({ artist, bands });
    } catch (error) {
      console.error("Error loading artist for edit:", error);
      res.status(500).send("Server error");
    }
  }
);
router.post(
  "/edit/artist/:id",
  authenticateJWT,
  isApiAdmin,
  upload.single("photo"),
  async (req, res) => {
    const { name, role, description, bandId } = req.body;

    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) {
        return res.status(404).send("Artist not found");
      }

      artist.name = name.trim();
      artist.role = role.trim();
      artist.description = description.trim();
      artist.band = bandId;

      if (req.file) {
        artist.photo = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }

      await artist.save();
      const bandDoc = await Band.findById(bandId);
      // log activity
      await ActivityLog.create({
        actionType: "artist_updated",
        message: `Artist "${artist.name}" updated in band "${bandDoc.name}"`,
        icon: "fa-user-edit",
      });
      res.status(200).json({
        message: "Artist successfully updated",
        artistId: artist._id,
      });
    } catch (error) {
      console.error("Error updating artist:", error);
      const artist = await Artist.findById(req.params.id);

      const bands = await Band.find({});
      res.status(500).json({
        errors: [{ msg: "An error occurred while updating the artist" }],
        artist,
        bands,
      });
    }
  }
);

// band edit

router.get("/edit/band/:id", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).lean();
    if (!band) {
      return res.status(404).send("No band found");
    }
    res.status(200).json({ band });
  } catch (error) {
    console.error("Error while fetching band details:", error);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/edit/band/:id",
  upload.single("image"),
  authenticateJWT,
  isAdmin,
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const band = await Band.findById(req.params.id);
      if (!band) {
        return res.status(404).send("No band found");
      }
      band.name = name.trim();
      band.discription = description.trim();
      if (req.file) {
        band.image = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
      await band.save();
      // log activity
      await ActivityLog.create({
        actionType: "band_updated",
        message: `Band "${band.name}" updated`,
        icon: "fa-music",
      });
      res.status(200).json({
        message: "Band successfully updated",
        bandId: band._id,
      });
      console.log("Band updated successfully");
    } catch (error) {
      console.error("Error while updating band:", error);
      res.status(500).send("Server Error");
    }
  }
);

// concert edit
router.get(
  "/edit/concerts/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const concert = await Concert.findById(req.params.id).populate("band");
      const bands = await Band.find({});
      if (!concert) {
        return res.status(404).send("Concert not found");
      }
      res.status(200).json({ concert, bands });
    } catch (error) {
      console.error("Error loading concert for edit:", error);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/edit/concerts/:id",
  isAdmin,
  upload.single("photo"),
  async (req, res) => {
    const {
      title = "",
      description = "",
      date,
      time,
      duration,
      city = "",
      venue = "",
      locationMapUrl = "",
      ticketPrice,
      totalTickets,
      ticketsAvailable,
      bookingEndsAt,
      tags = "",
      band,
      status,
    } = req.body;
    try {
      const concert = await Concert.findById(req.params.id);
      if (!concert) {
        return res.status(404).send("Concert not found");
      }
      concert.title = title.trim();
      concert.description = description.trim();
      concert.date = new Date(date);
      concert.time = time.trim();
      concert.duration = parseInt(duration);
      concert.city = city.trim().toLowerCase();
      concert.venue = venue.trim();
      concert.locationMapUrl = locationMapUrl.trim();
      concert.ticketPrice = parseFloat(ticketPrice);
      concert.totalTickets = parseInt(totalTickets);
      concert.ticketsAvailable = parseInt(ticketsAvailable);
      concert.bookingEndsAt = bookingEndsAt ? new Date(bookingEndsAt) : null;
      concert.tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      concert.band = band.trim();
      concert.status = status;
      if (req.file) {
        concert.concertImage = {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        };
      }
      await concert.save();

      const bandDoc = await Band.findById(band);

      await ActivityLog.create({
        // <-- Make sure your model is named Activity here
        actionType: "concert_updated",
        message: `Concert "${concert.title}" updated in band "${
          bandDoc ? bandDoc.name : "Unknown"
        }"`,
        icon: "fa-calendar-xmark", // or "fa-calendar-plus" if you prefer
      });

      console.log("Concert updated successfully");
      res.status(200).json({
        message: "Concert successfully updated",
        concertId: concert._id,
      });
    } catch (error) {
      console.error("Error while updating concert:", error);
      res.status(500).send("Server Error");
    }
  }
);

// booking routes
router.get("/bookings", isApiAdmin, authenticateJWT, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("concert user").lean();
    const totalcompletedcount = await Booking.countDocuments({
      status: "completed",
    });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: "completed" } }, // Only count completed bookings
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    res.status(200).json({
      bookings: bookings,
      totalcompletedcount: totalcompletedcount,
      totalRevenue: revenue,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Server Error");
  }
});
router.post(
  "/cancel-booking/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id).populate("concert");

      if (!booking) return res.status(404).send("Booking not found");

      const isPast = new Date(booking.concert.date) < new Date();
      if (isPast || booking.concert.status === "cancelled") {
        return res
          .status(400)
          .send("Cannot cancel booking for past/cancelled concert");
      }

      booking.status = "cancelled_by_admin";
      booking.cancelReason = "Cancelled by admin";
      booking.cancelledAt = new Date();
      await booking.save();

      // Optionally update concert ticket count back:
      await Concert.findByIdAndUpdate(booking.concert._id, {
        $inc: { ticketsAvailable: booking.ticketQuantity },
      });
      // log activity
      await ActivityLog.create({
        actionType: "booking_cancelled",
        message: `Booking for "${booking.concert.title}" cancelled by admin`,
        icon: "fa-ban",
      });
      res.status(200).json({
        message: "Booking successfully cancelled",
        bookingId: booking._id,
      });
    } catch (err) {
      console.error("Cancel error:", err);
      res.status(500).send("Server Error");
    }
  }
);

// usermanagement routes

router.get("/users", authenticateJWT, isApiAdmin, async (req, res) => {
  try {
    const users = await User.find().lean();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
});

router.get(
  "/approve/reviews",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const testimonials = await Testimonial.find({ isApproved: false }) // ✅ correct field
        .populate("user")
        .lean();

      res.status(200).json({ testimonials });
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).send("Server Error");
    }
  }
);
router.post(
  "/review/approve/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: true });
      res.status(200).json({
        message: "Review approved successfully",
      });
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).send("Server Error");
    }
  }
);

// review delete route
router.post(
  "/review/delete/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      await Testimonial.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).send("Server Error");
    }
  }
);

// artist delete routes
router.post(
  "/delete/artist/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      await Artist.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Artist deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artist:", error);
      res.status(500).send("Server Error");
    }
  }
);

// band delete routes
router.post(
  "/band/delete/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const concertCount = await Concert.countDocuments({
        band: req.params.id,
      });

      if (concertCount > 0) {
        res.status(400).json({
          message: "Cannot delete band with associated concerts.",
        });
      }

      await Band.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Band deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting band:", error);
      res.status(500).send("Server Error");
    }
  }
);

// concert delete routes

router.post(
  "/delete/concerts/:id",
  authenticateJWT,
  isApiAdmin,
  async (req, res) => {
    try {
      const concert = await Concert.findById(req.params.id);

      if (!concert) {
        return res.status(404).json({ message: "Concert not found" });
      }

      await Concert.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Concert deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting concert:", error);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
