const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isApproved: {
    type: Boolean,
    default: false, // Admin can toggle to show/hide
  },
});

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
