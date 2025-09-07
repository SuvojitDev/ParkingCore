// controllers/payment.controller.js
const Booking = require("../models/Booking");

exports.processPayment = async (req, res) => {
  try {
    const { bookingId, cardNumber, expiry, cvv, nameOnCard } = req.body;

    if (!bookingId || !cardNumber || !expiry || !cvv || !nameOnCard) {
      return res.status(400).json({ message: "Missing required payment details" });
    }

    // Basic mock validation
    if (cardNumber.length < 12 || cardNumber.length > 19) {
      return res.status(400).json({ message: "Invalid card number" });
    }
    if (cvv.length < 3 || cvv.length > 4) {
      return res.status(400).json({ message: "Invalid CVV" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    // Generate mock transaction ID
    const txnId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);

    booking.paymentStatus = "paid";
    booking.paymentMethod = "card";
    booking.transactionId = txnId;

    await booking.save();

    res.json({
      message: "Payment successful",
      bookingId: booking._id,
      transactionId: txnId,
      amount: booking.totalPrice,
      status: booking.paymentStatus
    });
  } catch (error) {
    console.error("processPayment error:", error);
    res.status(500).json({ message: "Server error while processing payment", error: error.message });
  }
};