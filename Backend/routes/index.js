require("dotenv").config();
const express = require("express");
const router = express.Router();
const Concert = require("../model/concertmodel");
const Band = require("../model/bandmodel");
const Artists = require("../model/artistmodel");
const Booking = require("../model/bookingmodel");
const Razorpay = require("razorpay");
const QRcode = require("qrcode");
const pdfticketgenerator = require("../utils/pdfgeneration");
const sendTicketEmail = require("../utils/sendemail");
const { isAuthenticated } = require("../Middleware/authentication");
const Activity = require("../model/activitylogmodel");
const Testimonial = require("../model/testimonalreview");
const Review = require("../model/reviewmodel");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// home
router.get("/", async (req, res) => {
  try {
    const now = new Date();

    // Step 1: Update all outdated "upcoming" concerts to "past" in one query
    await Concert.updateMany(
      { status: "upcoming", date: { $lt: now } },
      { $set: { status: "past" } }
    );

    // Step 2: Fetch upcoming concerts (limit 8), sorted by date
    const concertsToShow = await Concert.find({ status: "upcoming" })
      .sort({ date: 1 })
      .limit(8)
      .populate("band")
      .lean();

    // Step 3: Convert time format
    concertsToShow.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });

    // Step 4: Get 4 random artists
    const countArtists = await Artists.countDocuments();
    const randomIndexes = Array.from(
      { length: Math.min(4, countArtists) },
      () => Math.floor(Math.random() * countArtists)
    );

    const randomArtists = await Promise.all(
      randomIndexes.map((i) => Artists.findOne().skip(i))
    );

    // Step 5: Get approved testimonials
    const testimonials = await Testimonial.find({ isApproved: true })
      .populate("user")
      .lean();

    // Step 6: Render the page
    res.render("common/home", {
      concerts: concertsToShow,
      randomArtists,
      totalConcerts: concertsToShow.length,
      convertTo12Hour,
      testimonials,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).send("Server Error");
  }
});

// contert list
router.get("/concert/list", async (req, res) => {
  try {
    const now = new Date();

    // Step 1: Get all concerts (not lean yet, since we need to update them)
    let allConcerts = await Concert.find({});

    // Step 2: Update status to "past" based on date
    await Promise.all(
      allConcerts.map(async (concert) => {
        if (concert.status === "upcoming" && concert.date < now) {
          concert.status = "past";
          await concert.save();
        }
      })
    );

    // Step 3: Now continue with your filters
    const { city, query, status } = req.query;

    // City filter (optional)
    const cityFilter = city && city.toLowerCase() !== "all" ? { city } : {};

    // Status filter
    const statusValue = status || "upcoming";

    if (statusValue.toLowerCase() === "upcoming") {
      statusFilter = { date: { $gte: now } };
    } else if (statusValue.toLowerCase() === "past") {
      statusFilter = { date: { $lt: now } };
    } else {
      statusFilter = { status: statusValue };
    }

    // Band search (optional)
    let bandIds = [];
    if (query) {
      const bands = await Band.find({
        name: { $regex: query, $options: "i" },
      }).select("_id");
      bandIds = bands.map((band) => band._id);
    }

    // Build concert query
    const concertQuery = {
      ...statusFilter,
      ...cityFilter,
      ...(query && {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
          { band: { $in: bandIds } },
        ],
      }),
    };

    // Fetch concerts to display
    const concerts = await Concert.find(concertQuery)
      .populate("band")
      .sort({ date: 1 })
      .lean();

    // Get filter options
    const cities = (await Concert.distinct("city")).sort();
    const statuses = await Concert.distinct("status").sort();

    // Convert time format
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });

    res.render("common/concertlist", {
      concerts,
      cities,
      selectedCity: city || "All",
      selectedStatus: status || "upcoming",
      query,
      statuses,
      convertTo12Hour,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading concerts:", error);
    res.status(500).send("Server Error");
  }
});

// concert detail
router.get("/concert/:id", async (req, res) => {
  try {
    const now = new Date();
    const concertId = req.params.id;

    const concertDoc = await Concert.findById(req.params.id).populate("band");
    if (!concertDoc) {
      return res.status(404).send("Concert not found");
    }

    // Auto-update to 'past' if date has passed
    if (concertDoc.status === "upcoming" && concertDoc.date < now) {
      concertDoc.status = "past";
      await concertDoc.save();
    }

    const concert = await Concert.findById(req.params.id)
      .populate("band")
      .lean();

    const artists = await Artists.find({ band: concert.band._id }).lean();

    if (!concert) {
      return res.status(404).send("Concert not found");
    }

    const hours = Math.floor(concert.duration / 60);
    const minutes = concert.duration % 60;
    concert.durationFormatted = `${hours > 0 ? hours + " hr" : ""} ${
      minutes > 0 ? minutes + " min" : ""
    }`.trim();

    concert.time12hr = convertTo12Hour(concert.time);
    // check user session exist then store user
    const user = req.session.user ? req.session.user._id : null;

    // Fetch all reviews for this concert
    const reviews = await Review.find({ concert: concertId })
      .populate("user")
      .lean();

    // Calculate total ratings and counts per star (1 to 5)
    const ratingData = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return { star, count };
    });

    // Calculate total number of reviews
    const total = reviews.length;

    // Calculate average rating
    let rating_based_on_star = 0;
    ratingData.forEach((r) => (rating_based_on_star += r.star * r.count));
    const average = total === 0 ? 0 : (rating_based_on_star / total).toFixed(1);

    res.render("common/concertdetail", {
      artists,
      concert,
      user,
      ratingData,
      total,
      average,
      reviews,
      convertTo12Hour,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading concert:", error);
    res.status(500).send("Server Error");
  }
});
// concert review post
router.post("/concerts/review/:id", isAuthenticated, async (req, res) => {
  try {
    const concertId = req.params.id;
    const userId = req.session.user._id; // assuming user info is in req.user
    const { rating, comment } = req.body;

    // Create new review
    const review = new Review({
      concert: concertId,
      user: userId,
      rating: Number(rating),
      comment: comment || "",
    });

    await review.save();
    req.flash("success", "Review submitted successfully!");
    res.redirect(`/concert/${concertId}`); // Redirect back to concert detail page
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// band profile

router.get("/concert/band/:id", async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).lean();
    const concerts = await Concert.find({ band: band._id }).lean();
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });
    const artists = await Artists.find({ band: band._id }).lean();
    res.render("common/Bandprofile", { band, concerts, artists });
  } catch (error) {
    console.error("Error loading band:", error);
    res.status(500).send("Server Error");
  }
});

// artistlist
router.get("/artists/list", async (req, res) => {
  try {
    const artists = await Artists.find().populate("band").lean();
    res.render("common/artistlist", { artists, errors: [] });
  } catch (error) {
    console.error("Error loading artists:", error);
    res.status(500).send("Server Error");
  }
});

// artist profile detail
router.get("/artist/:id", async (req, res) => {
  try {
    const artist = await Artists.findById(req.params.id)
      .populate("band")
      .lean();
    const otherMembers = await Artists.find({
      band: artist.band._id,
      _id: { $ne: artist._id },
    }).lean();
    const concerts = await Concert.find({ band: artist.band._id }).lean();
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });
    res.render("common/artistprofile", {
      artist,
      otherMembers,
      concerts,
      errors: [],
    });
  } catch (error) {
    console.error("Error loading artist:", error);
    res.status(500).send("Server Error");
  }
});

// booking
router.get("/concert/:id/book", isAuthenticated, async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).lean();
    concert.time12hr = convertTo12Hour(concert.time);

    const existingbookings = await Booking.find({
      concert: concert._id,
      user: req.session.user._id,
    }).lean();
    const alreadybookedcount = existingbookings.reduce(
      (total, booking) => total + booking.ticketQuantity,
      0
    );
    if (alreadybookedcount >= 3) {
      return res.render("common/booking", {
        concert,
        errors: ["You have already booked 3 tickets for this concert."],
        maxticketleft: 0,
        totalBooked: alreadybookedcount,
      });
    }
    const maxticketleft = 3 - alreadybookedcount;

    res.render("common/booking", {
      concert,
      maxticketleft,
      totalBooked: alreadybookedcount,
      errors: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// razorpay payment
router.post("/booking/checkout", isAuthenticated, async (req, res) => {
  try {
    const { concertId, ticketQuantity, totalPrice } = req.body;
    const amountInPaise = parseInt(totalPrice) * 100;

    const options = {
      amount: amountInPaise, // amount in the smallest currency unit
      currency: "INR",
      receipt: "booking-" + Math.floor(Math.random() * 1000000),
    };
    const order = await razorpay.orders.create(options);

    const concert = await Concert.findById(concertId).lean();
    concert.time12hr = convertTo12Hour(concert.time);

    res.render("common/payment", {
      order,
      concert,
      ticketQuantity,
      totalPrice,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      errors: [],
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/booking/confirm", isAuthenticated, async (req, res) => {
  try {
    const { razorpayPaymentId, concertId, ticketQuantity, totalPrice } =
      req.body;

    // Use Razorpay payment ID as ticket ID
    const ticketid = razorpayPaymentId;

    // Generate QR code with the ticket ID
    const qrcode = await QRcode.toDataURL(ticketid);

    // Create new booking document
    const newBooking = await Booking.create({
      concert: concertId,
      user: req.session.user._id,
      ticketQuantity,
      totalPrice,
      qrcode,
      ticketid,
    });

    const concertDoc = await Concert.findById(concertId).lean();

    // update activitylog
    await Activity.create({
      actionType: "booking_created",
      message: `New booking for ${concertDoc.title}`,
      icon: "fa-ticket",
    });

    // Update tickets available for the concert
    await Concert.findByIdAndUpdate(concertId, {
      $inc: { ticketsAvailable: -ticketQuantity },
    });

    // Respond with booking ID so the frontend can redirect
    res.status(200).json({
      message: "Booking confirmed!",
      success: true,
      bookingId: newBooking._id,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

///booking success
router.get("/booking/success/:id", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "concert",
        populate: { path: "band" },
      })
      .populate("user");

    if (!booking) return res.status(404).send("Booking not found");

    booking.concert.time12hr = convertTo12Hour(booking.concert.time);

    res.render("common/success", { booking, shared: req.query.shared === "1" });
  } catch (err) {
    console.error("Error loading booking success page:", err);
    res.status(500).send("Server Error");
  }
});

// share email ticket
router.get("/booking/share/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate({
        path: "concert",
        populate: { path: "band" },
      });

    if (!booking) return res.status(404).send("Booking not found");

    const pdfBuffer = await pdfticketgenerator(booking);

    await sendTicketEmail(booking.user.email, booking, pdfBuffer);
    req.flash("success", "Ticket shared successfully!"); // add flash message to session
    res.redirect("/booking/success/" + booking._id + "?shared=1"); // redirect back to ticket page
  } catch (error) {
    console.error("Share ticket email error:", error);
    res.status(500).send("Server error");
  }
});
// download ticket pdf
router.get("/booking/download/:id", isAuthenticated, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "concert",
        populate: { path: "band" },
      })
      .populate("user");

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

// time convertion function
function convertTo12Hour(time24) {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
}

module.exports = router;
