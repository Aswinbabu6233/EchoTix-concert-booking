const express = require("express");
const router = express.Router();
const User = require("../../model/usermodel");
const Concert = require("../../model/concertmodel");
const Artist = require("../../model/artistmodel");
const Band = require("../../model/bandmodel");

// Cache control headers for images (cache for 1 day, revalidate after)
const setCacheHeaders = (res) => {
  res.set({
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    "Expires": new Date(Date.now() + 86400000).toUTCString(),
  });
};

// Default placeholder image (1x1 transparent PNG)
const PLACEHOLDER_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

/**
 * GET /api/images/user/:id
 * Serves user profile image
 */
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("profileImage");
    
    if (!user || !user.profileImage || !user.profileImage.data) {
      setCacheHeaders(res);
      res.set("Content-Type", "image/png");
      return res.send(PLACEHOLDER_IMAGE);
    }

    setCacheHeaders(res);
    res.set("Content-Type", user.profileImage.contentType || "image/png");
    res.send(user.profileImage.data);
  } catch (error) {
    console.error("Error fetching user image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

/**
 * GET /api/images/concert/:id
 * Serves concert image
 */
router.get("/concert/:id", async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).select("concertImage");
    
    if (!concert || !concert.concertImage || !concert.concertImage.data) {
      setCacheHeaders(res);
      res.set("Content-Type", "image/png");
      return res.send(PLACEHOLDER_IMAGE);
    }

    setCacheHeaders(res);
    res.set("Content-Type", concert.concertImage.contentType || "image/png");
    res.send(concert.concertImage.data);
  } catch (error) {
    console.error("Error fetching concert image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

/**
 * GET /api/images/artist/:id
 * Serves artist photo
 */
router.get("/artist/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).select("photo");
    
    if (!artist || !artist.photo || !artist.photo.data) {
      setCacheHeaders(res);
      res.set("Content-Type", "image/png");
      return res.send(PLACEHOLDER_IMAGE);
    }

    setCacheHeaders(res);
    res.set("Content-Type", artist.photo.contentType || "image/png");
    res.send(artist.photo.data);
  } catch (error) {
    console.error("Error fetching artist image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

/**
 * GET /api/images/band/:id
 * Serves band image
 */
router.get("/band/:id", async (req, res) => {
  try {
    const band = await Band.findById(req.params.id).select("image");
    
    if (!band || !band.image || !band.image.data) {
      setCacheHeaders(res);
      res.set("Content-Type", "image/png");
      return res.send(PLACEHOLDER_IMAGE);
    }

    setCacheHeaders(res);
    res.set("Content-Type", band.image.contentType || "image/png");
    res.send(band.image.data);
  } catch (error) {
    console.error("Error fetching band image:", error);
    res.status(500).json({ message: "Error fetching image" });
  }
});

module.exports = router;
