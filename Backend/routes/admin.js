const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require("multer");
const Band = require("../model/bandmodel");
const Artist = require("../model/artistmodel");
const Concert = require("../model/concertmodel");
const User = require("../model/usermodel");
const Booking = require("../model/bookingmodel");
const { isAdmin } = require("../Middleware/authentication");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ActivityLog = require("../model/activitylogmodel");
const Testimonial = require("../model/testimonalreview");

// admin login

router.get("/login", (req, res) => {
  res.render("Admin/adminlogin", { errors: [], hidenav: true });
});

router.post(
  "/adminlogin",
  [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("Admin/adminlogin", { errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const emaillowercase = email.toLowerCase();
      const admin = await User.findOne({
        email: emaillowercase,
        role: "admin",
      });
      if (!admin) {
        return res.render("Admin/adminlogin", {
          errors: [{ msg: "No user found or invalid email" }],
        });
      }
      // show retrive bcrypt password to orginal password

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.render("Admin/adminlogin", {
          errors: [{ msg: "Incorrect password" }],
        });
      }
      req.session.user = {
        _id: admin._id,
        role: admin.role,
        username: admin.username,
      };
      req.flash("success_msg", "Welcome back" + " " + admin.username);
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).render("Admin/adminlogin", {
        errors: [{ msg: "Server error. Please try again later." }],
      });
    }
  }
);

// logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

// dashboard
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
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

    const admin = await User.findById(req.session.user._id);
    const now = new Date();
    const upcomingConcerts = await Concert.find({ date: { $gte: now } })
      .populate("band")
      .sort({ date: 1 })
      .lean();

    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .lean(); // Newest first
    const bands = await Band.find({}).sort({ createdAt: -1 }).lean();
    const artists = await Artist.find({})
      .populate("band", "name") // populate only the 'name' field of the band
      .sort({ createdAt: -1 })
      .lean();
    const concerts = await Concert.find({})
      .populate("band")
      .sort({ createdAt: -1 }) // or sort by 'date' if you prefer that
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

    res.render("Admin/dashboard", {
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
    res.status(500).send("Server Error");
  }
});
// band management

router.get("/bands", isAdmin, async (req, res) => {
  try {
    const bands = await Band.find({}).sort({ createdAt: -1 }).lean();
    res.render("Admin/bandmanagement", { bands });
  } catch (error) {
    console.error("Error loading bands:", error);
    res.status(500).send("Server Error");
  }
});

// band upload
router.get("/create/band", isAdmin, async (req, res) => {
  res.render("Admin/Addband", { errors: [] });
});

router.post(
  "/create/bandsubmit",
  isAdmin,
  upload.single("bandimg"),
  [
    body("bandname").notEmpty().withMessage("Band Name is required"),
    body("banddiscription")
      .notEmpty()
      .withMessage("Band discription in required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("Admin/Addband", {
        errors: errors.array(),
      });
    }

    if (!req.file) {
      return res.render("Admin/Addband", {
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
      // activitylog
      await ActivityLog.create({
        actionType: "band_added",
        message: `New band "${band.name}" added`,
        icon: "fa-headphones",
      });
      req.flash("success_msg", "Band added successfully!");
      res.redirect("/admin/bands"); // Adjust path as needed
    } catch (error) {
      console.error("Error while saving band details:", error);
      res.status(500).render("Admin/Addband", {
        errors: [{ msg: "An error occurred while saving the band data" }],
      });
    }
  }
);

// artistmanagement

router.get("/artists", isAdmin, async (req, res) => {
  try {
    const artists = await Artist.find({})
      .populate("band") // populate only the 'name' field of the band
      .sort({ createdAt: -1 })
      .lean();
    res.render("Admin/artistmanagement", { artists });
  } catch (error) {
    console.error("Error loading artists:", error);
    res.status(500).send("Server Error");
  }
});

// GET /create/artist
router.get("/create/artist", isAdmin, async (req, res) => {
  try {
    const bands = await Band.find({});
    res.render("Admin/AddArtist", { bands, errors: [] }); // send bands to EJS
  } catch (error) {
    console.error("Error while finding band details:", error);
    res.status(500).render("Admin/AddArtist", {
      bands: [],
      errors: [{ msg: "An error occurred while fetching band data" }],
    });
  }
});

// POST route to handle form submission
router.post("/artists", isAdmin, upload.array("photos"), async (req, res) => {
  const { bandId, name, role, description } = req.body;
  const photos = req.files;

  try {
    if (!Array.isArray(name) || !Array.isArray(role) || photos.length === 0) {
      return res.status(400).render("Admin/AddArtist", {
        errors: [
          { msg: "All fields are required and must be equal in count." },
        ],
        bands: await Band.find({}),
      });
    }
    const ArtistData = [];
    for (let i = 0; i < name.length; i++) {
      ArtistData.push({
        name: name[i].trim(),
        role: role[i].trim(),
        description: description[i].trim(),
        band: bandId,
        photo: {
          data: photos[i].buffer,
          contentType: photos[i].mimetype,
        },
      });
    }
    await Artist.insertMany(ArtistData);

    const banddoc = await Band.findById(bandId);

    // log activity
    await ActivityLog.create({
      actionType: "artist_added",
      message: `New artists "${ArtistData.map((a) => a.name).join(
        ", "
      )} added to band "${banddoc.name}"`,
      icon: "fa-users",
    });

    req.flash("success_msg", "Artists added successfully!");
    res.redirect("/admin/artists");
    console.log("Artist uploaded sucess");
  } catch (error) {
    console.error("Error Creating Artists:", error);
    res.status(500).render("Admin/AddArtist", {
      errors: [{ msg: "Server error occured while saving Artists Data" }],
      bands: await Band.find({}),
    });
  }
});

// concertmanagement
router.get("/concerts", isAdmin, async (req, res) => {
  try {
    const concerts = await Concert.find({})
      .populate("band")
      .sort({ createdAt: -1 })
      .lean();
    res.render("Admin/concertmanagement", { concerts });
  } catch (error) {
    console.error("Error loading concerts:", error);
    res.status(500).send("Server Error");
  }
});

// concert creation
router.get("/create/concerts", isAdmin, async (req, res) => {
  try {
    const bands = await Band.find({});
    res.render("Admin/Addconcert", { bands, errors: [] });
  } catch (err) {
    console.error(err);
    res.render("Admin/Addconcert", {
      bands: [],
      errors: [{ msg: "Failed to load bands." }],
    });
  }
});

// concert creation post

router.post(
  "/concerts",
  isAdmin,
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
      return res.status(400).render("Admin/Addconcert", {
        bands: await Band.find({}),
        errors: errors.array(),
      });
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
      req.flash("success_msg", "Concert added successfully!");
      res.redirect("/admin/concerts");
    } catch (error) {
      console.error("Concert creation error:", error);
      res.status(500).render("Admin/Addconcert", {
        bands: await Band.find({}),
        errors: [{ msg: "Something went wrong while saving the concert." }],
      });
    }
  }
);

// edit section

// artist edit
router.get("/edit/artist/:id", isAdmin, async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate("band");
    const bands = await Band.find({});
    if (!artist) {
      return res.status(404).send("Artist not found");
    }
    res.render("Admin/EditArtist", { artist, bands, errors: [] });
  } catch (error) {
    console.error("Error loading artist for edit:", error);
    res.status(500).send("Server error");
  }
});
router.post(
  "/edit/artist/:id",
  isAdmin,
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
      req.flash("success_msg", "Artist updated successfully!");
      res.redirect("/admin/artists");
    } catch (error) {
      console.error("Error updating artist:", error);
      const artist = await Artist.findById(req.params.id);

      const bands = await Band.find({});
      res.status(500).render("Admin/EditArtist", {
        artist,
        bands,
        errors: [{ msg: "Server error while updating artist" }],
      });
    }
  }
);

// band edit

router.get("/edit/band/:id", isAdmin, async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).lean();
    if (!band) {
      return res.status(404).send("No band found");
    }
    res.render("Admin/EditBand", { band });
  } catch (error) {
    console.error("Error while fetching band details:", error);
    res.status(500).send("Server Error");
  }
});

router.post(
  "/edit/band/:id",
  upload.single("image"),
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
      req.flash("success_msg", "Band updated successfully!");
      res.redirect("/admin/bands");
      console.log("Band updated successfully");
    } catch (error) {
      console.error("Error while updating band:", error);
      res.status(500).send("Server Error");
    }
  }
);
// concert edit
router.get("/edit/concerts/:id", isAdmin, async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).populate("band");
    const bands = await Band.find({});
    if (!concert) {
      return res.status(404).send("Concert not found");
    }
    res.render("Admin/EditConcert", { concert, bands, errors: [] });
  } catch (error) {
    console.error("Error loading concert for edit:", error);
    res.status(500).send("Server error");
  }
});

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
      req.flash("success_msg", "Concert updated successfully!");
      res.redirect("/admin/concerts");
    } catch (error) {
      console.error("Error while updating concert:", error);
      res.status(500).send("Server Error");
    }
  }
);

// booking routes
router.get("/bookings", isAdmin, async (req, res) => {
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

    res.render("Admin/Bookingmanagement", {
      bookings,
      revenue,
      totalcompletedcount,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Server Error");
  }
});
router.post("/cancel-booking/:id", isAdmin, async (req, res) => {
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
    req.flash("success_msg", "Booking cancelled successfully!");
    res.redirect("/admin/bookings");
  } catch (err) {
    console.error("Cancel error:", err);
    res.status(500).send("Server Error");
  }
});

// usermanagement routes

router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render("Admin/usermanagement", { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/approve/reviews", isAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: false }) // ✅ correct field
      .populate("user")
      .lean();

    res.render("Admin/testimonials", { testimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).send("Server Error");
  }
});
router.post("/review/approve/:id", isAdmin, async (req, res) => {
  try {
    await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: true });
    req.flash("success_msg", "Review approved successfully!");
    res.redirect("/admin/approve/reviews");
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).send("Server Error");
  }
});
// review delete route
router.post("/review/delete/:id", isAdmin, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Review deleted successfully!");
    res.redirect("/admin/approve/reviews");
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).send("Server Error");
  }
});

// artist delete routes
router.post("/delete/artist/:id", isAdmin, async (req, res) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Artist deleted successfully!");
    res.redirect("/admin/artists");
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).send("Server Error");
  }
});

// band delete routes
router.post("/band/delete/:id", isAdmin, async (req, res) => {
  try {
    const concertCount = await Concert.countDocuments({ band: req.params.id });

    if (concertCount > 0) {
      req.flash("error_msg", "Cannot delete band with active concerts.");
      return res.redirect("/admin/bands");
    }

    await Band.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Band deleted successfully!");
    res.redirect("/admin/bands");
  } catch (error) {
    console.error("Error deleting band:", error);
    res.status(500).send("Server Error");
  }
});

// concert delete routes

router.post("/delete/concerts/:id", isAdmin, async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);

    if (!concert) {
      req.flash("error_msg", "Concert not found.");
      return res.redirect("/admin/concerts");
    }

    await Concert.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Concert deleted successfully.");
    res.redirect("/admin/concerts");
  } catch (error) {
    console.error("Error deleting concert:", error);
    req.flash("error_msg", "Server error. Please try again later.");
    res.redirect("/admin/concerts");
  }
});

module.exports = router;
