const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      enum: [
        "user_registered",
        "booking_created",
        "booking_cancelled",
        "concert_updated",
        "user_deleted",
        "concert_added",
        "band_added",
        "artist_added",
        "artist_updated",
        "band_updated",
        "user_cancelled_ticket",
      ],
    },
    message: String,
    icon: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
