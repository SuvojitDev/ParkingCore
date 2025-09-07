// routes/payment.routes.js
const router = require("express").Router();
const { auth } = require("../middleware/auth.middleware");
const { processPayment } = require("../controllers/payment.controller");

// Only customer can pay for their booking
router.post("/", auth("Customer"), processPayment);

module.exports = router;