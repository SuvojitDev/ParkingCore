// models/Parking.js
const mongoose = require("mongoose");

const ParkingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["free", "reserved", "occupied"],
      default: "free",
      index: true
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    location: {
      type: String, // human-readable address
      required: true,
      trim: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["Car", "Bike", "EV", "Disabled"],
      default: "Car"
    },
    pricePerHour: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Parking", ParkingSchema);
