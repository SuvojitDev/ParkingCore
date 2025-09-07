// coontrollers/booking.controller.js
const Booking = require("../models/Booking");
const Parking = require("../models/Parking");

// Customer bookings
exports.createBooking = async (req, res) => {
  const { parkingId, startTime, endTime } = req.body;
  if (!parkingId || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const slot = await Parking.findById(parkingId);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  if (slot.status !== "free") {
    return res.status(400).json({ message: `Slot is ${slot.status}` });
  }

  const newStart = new Date(startTime);
  const newEnd = new Date(endTime);

  if (newStart >= newEnd) {
    return res.status(400).json({ message: "End time must be after start time" });
  }

  // 🔹 Check for overlapping bookings
  const conflict = await Booking.findOne({
    parkingId,
    status: "active",
    $or: [
      { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
    ]
  });

  if (conflict) {
    return res.status(400).json({ message: "Slot already booked during this time" });
  }

  // 🔹 Calculate total price
  const durationMs = newEnd - newStart;
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // round up hours
  const totalPrice = durationHours * slot.pricePerHour;

  // 🔹 Create booking
  const booking = await Booking.create({
    userId: req.user.id,
    parkingId,
    startTime: newStart,
    endTime: newEnd,
    totalPrice
  });

  // 🔹 Update slot status
  slot.status = "reserved";
  await slot.save();

  res.status(201).json(booking);
};



exports.listMyBookings = async (req, res) => {
  const query = req.user.role === "Customer" ? { userId: req.user.id } : {};

  // ✨ CHAIN ANOTHER .populate() TO GET THE USER'S NAME
  const bookings = await Booking.find(query)
    .populate("parkingId", "code") // Gets the parking slot code
    .populate("userId", "name")    // Gets the user's name
    .lean();

  res.json(bookings);
};

// Manager completes, Customer cancels
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // "completed" or "cancelled"
  const booking = await Booking.findById(id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  // If customer, only allow cancel their own
  if (req.user.role === "Customer" && String(booking.userId) !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  booking.status = status;
  await booking.save();

  // free slot if completed/cancelled
  if (status === "completed" || status === "cancelled") {
    const slot = await Parking.findById(booking.parkingId);
    if (slot) {
      slot.status = "free";
      await slot.save();
    }
  }

  res.json(booking);
};
