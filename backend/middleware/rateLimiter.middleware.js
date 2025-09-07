// middleware/rateLimiter.middleware.js
const rateLimit = require("express-rate-limit");

// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limiter;