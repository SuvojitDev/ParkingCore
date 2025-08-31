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
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Parking", ParkingSchema);