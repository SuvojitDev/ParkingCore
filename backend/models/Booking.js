// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      trim: true
    },
    parkingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
      index: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true,
      trim: true
    },
    endTime: {
      type: Date,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
      trim: true
    },
    totalPrice: { type: Number, required: true },
    // Payment fields
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentMethod: { type: String }, // e.g., "card"
    transactionId: { type: String }, // mock ID
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Booking", BookingSchema);