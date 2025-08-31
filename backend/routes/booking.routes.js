// routes/booking.routes.js
const router = require("express").Router();
const { auth } = require("../middleware/auth.middleware");
const { createBooking, listMyBookings, updateBookingStatus } = require("../controllers/booking.controller");

router.post("/", auth(["Customer", "Manager", "Admin"]), createBooking);
router.get("/", auth(["Customer", "Manager", "Admin"]), listMyBookings);
router.patch("/:id/status", auth(["Customer", "Manager", "Admin"]), updateBookingStatus);

module.exports = router;