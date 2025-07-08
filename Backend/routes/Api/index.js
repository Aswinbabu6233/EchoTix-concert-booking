require("dotenv").config();
const express = require("express");
const router = express.Router();
const Concert = require("../../model/concertmodel");
const Band = require("../../model/bandmodel");
const Artists = require("../../model/artistmodel");
const Booking = require("../../model/bookingmodel");
const Razorpay = require("razorpay");
const QRcode = require("qrcode");
const pdfticketgenerator = require("../../utils/pdfgeneration");
const sendTicketEmail = require("../../utils/sendemail");
const Activity = require("../../model/activitylogmodel");
const Testimonial = require("../../model/testimonalreview");
const Review = require("../../model/reviewmodel");
const {
  authenticateJWT,
  isApiUser,
} = require("../../Middleware/apiauthentication");

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
      randomIndexes.map(
        (i) => Artists.findOne().skip(i).lean() // lean gives a plain object
      )
    );

    // Step 5: Get approved testimonials
    const testimonials = await Testimonial.find({ isApproved: true })
      .populate("user")
      .lean();
    res.status(200).json({
      success: true,
      data: {
        concerts: concertsToShow,
        artists: randomArtists,
        totalConcerts: concertsToShow.length,
        testimonials: testimonials,
        error: [],
      },
    });
  } catch (error) {
    console.error("Error loading homepage:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/concert/list", async (req, res) => {
  try {
    const now = new Date();

    // Step 1: Update outdated concerts
    const allConcerts = await Concert.find({});
    await Promise.all(
      allConcerts.map(async (concert) => {
        if (concert.status === "upcoming" && concert.date < now) {
          concert.status = "past";
          await concert.save();
        }
      })
    );

    // Step 2: Filters
    const { city, query, status } = req.query;

    const cityFilter = city && city.toLowerCase() !== "all" ? { city } : {};

    const statusValue = status || "upcoming";
    if (statusValue.toLowerCase() === "upcoming") {
      statusFilter = { date: { $gte: now }, status: "upcoming" };
    } else if (statusValue.toLowerCase() === "past") {
      statusFilter = { date: { $lt: now }, status: "past" };
    } else {
      statusFilter = { status: statusValue };
    }

    // Step 3: Band search (optional)
    let bandIds = [];
    if (query) {
      const bands = await Band.find({
        name: { $regex: query, $options: "i" },
      }).select("_id");
      bandIds = bands.map((band) => band._id);
    }

    // Step 4: Build query
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

    const concerts = await Concert.find(concertQuery)
      .populate("band")
      .sort({ date: 1 })
      .lean();

    // Step 5: Format time
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });

    const cities = (await Concert.distinct("city")).sort();
    const statuses = await Concert.distinct("status").sort();

    res.status(200).json({
      concerts,
      totalConcerts: concerts.length,
      cities,
      statuses,
      selectedCity: city || "all",
      selectedStatus: status || "upcoming",
      query,
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

    let concertDoc = await Concert.findById(concertId).populate("band");
    if (!concertDoc) {
      return res.status(404).json({ message: "Concert not found" });
    }

    // Auto-update status if date has passed
    if (concertDoc.status === "upcoming" && concertDoc.date < now) {
      concertDoc.status = "past";
      await concertDoc.save();
    }

    const concert = concertDoc.toObject(); // convert to plain object
    const artists = await Artists.find({ band: concert.band._id }).lean();

    const hours = Math.floor(concert.duration / 60);
    const minutes = concert.duration % 60;
    concert.durationFormatted = `${hours > 0 ? hours + " hr" : ""} ${
      minutes > 0 ? minutes + " min" : ""
    }`.trim();

    concert.time12hr = convertTo12Hour(concert.time);

    const reviews = await Review.find({ concert: concertId })
      .populate("user")
      .lean();

    const ratingData = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => r.rating === star).length;
      return { star, count };
    });

    const total = reviews.length;
    let rating_based_on_star = 0;
    ratingData.forEach((r) => (rating_based_on_star += r.star * r.count));
    const average = total === 0 ? 0 : (rating_based_on_star / total).toFixed(1);

    res.status(200).json({
      concert,
      artists,
      reviews,
      ratingData,
      total,
      average,
    });
  } catch (error) {
    console.error("Error fetching concert details:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// concert list

// concert review post
router.post(
  "/concerts/review/:id",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
    try {
      const concertId = req.params.id;
      const userId = req.user.userId; // Assuming user ID is stored in JWT payload
      const { rating, comment } = req.body;

      // Create new review
      const review = new Review({
        concert: concertId,
        user: userId,
        rating: Number(rating),
        comment: comment || "",
      });

      await review.save();
      res.status(201).json({ message: "Review added successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// band profile

router.get("/concert/band/:id", async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).lean();
    const concerts = await Concert.find({ band: band._id }).lean();
    concerts.forEach((concert) => {
      concert.time12hr = convertTo12Hour(concert.time);
    });
    const artists = await Artists.find({ band: band._id }).lean();
    res.status(200).json({
      message: "Band profile loaded successfully",
      band,
      concerts,
      artists,
    });
  } catch (error) {
    console.error("Error loading band:", error);
    res.status(500).send("Server Error");
  }
});

// artistlist
router.get("/artists/list", async (req, res) => {
  try {
    const artists = await Artists.find().populate("band").lean();
    res.status(200).json({
      message: "Artists loaded successfully",
      artists,
    });
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
    res.status(200).json({
      message: "Artist profile loaded successfully",
      artist,
      otherMembers,
      concerts,
    });
  } catch (error) {
    console.error("Error loading artist:", error);
    res.status(500).send("Server Error");
  }
});

// booking
router.get(
  "/concert/:id/book",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
    try {
      const concert = await Concert.findById(req.params.id).lean();
      concert.time12hr = convertTo12Hour(concert.time);

      const existingbookings = await Booking.find({
        concert: concert._id,
        user: req.user.userId,
      }).lean();
      const alreadybookedcount = existingbookings.reduce(
        (total, booking) => total + booking.ticketQuantity,
        0
      );
      if (alreadybookedcount >= 3) {
        return res.status(400).json({
          message:
            "You have already booked the maximum number of tickets for this concert.",
        });
      }
      const maxticketleft = 3 - alreadybookedcount;

      res.status(200).json({
        message: "Concert booking page loaded successfully",
        concert,
        alreadybookedcount,
        maxticketleft,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
);

// razorpay payment
router.post(
  "/booking/checkout",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
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

      res.status(200).json({
        message: "Razorpay order created successfully",
        order,
        concert,
        ticketQuantity,
        totalPrice,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).send("Server Error");
    }
  }
);
router.post(
  "/booking/confirm",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
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
        user: req.user.userId,
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
  }
);

///booking success
// GET /booking/success/:id
router.get("/success/:id", authenticateJWT, isApiUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "concert",
        populate: { path: "band" },
      })
      .populate({ path: "user" })
      .lean(); // ✅ Makes it a plain object, easy to manipulate

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ✅ Convert image buffer to base64 safely
    if (
      booking.concert &&
      booking.concert.concertImage &&
      booking.concert.concertImage.data
    ) {
      booking.concert.concertImage.data =
        booking.concert.concertImage.data.toString("base64");
    }

    booking.concert.time12hr = convertTo12Hour(booking.concert.time);

    res.status(200).json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/booking/share/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "concert",
        populate: { path: "band" },
      })
      .populate("user")
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (!booking.user || !booking.user.email) {
      return res.status(400).json({ message: "User email not available" });
    }

    const pdfBuffer = await pdfticketgenerator(booking);
    await sendTicketEmail(booking.user.email, booking, pdfBuffer);

    res.status(200).json({
      message: "Ticket shared successfully via email",
      success: true,
    });
  } catch (error) {
    console.error("Share ticket email error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// download ticket pdf
router.get(
  "/booking/download/:id",
  authenticateJWT,
  isApiUser,
  async (req, res) => {
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
      console.error("Share ticket email error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// time convertion function
function convertTo12Hour(time24) {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minuteStr} ${ampm}`;
}

module.exports = router;
