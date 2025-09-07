const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter.middleware");
const usageLogger = require("./middleware/usageLogger.middleware");

// Initialize Express app first
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(rateLimiter);
// app.use(usageLogger);

// Enable CORS
app.use(cors({
  origin: "http://localhost:4200",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/parking", require("./routes/parking.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/payment", require("./routes/payment.routes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
