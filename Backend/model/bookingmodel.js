const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert" },
  ticketQuantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  qrcode: { type: String },
  ticketid: { type: String, Unique: true, required: true },
  status: {
    type: String,
    enum: ["cancelled_by_admin", "cancelled_by_user", "completed"],
    default: "completed",
  },
  createdAt: { type: Date, default: Date.now },
  cancelReason: {
    type: String, // e.g., "Admin cancelled due to event issues"
  },
  cancelledAt: {
    type: Date,
  },
});
const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
