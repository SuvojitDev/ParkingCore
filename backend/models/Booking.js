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
      required: true ,
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
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Booking", BookingSchema);