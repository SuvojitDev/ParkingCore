// middleware/usageLogger.middleware.js
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../logs/usage.log");

const usageLogger = async (req, _res, next) => {
  try {
    // Only log POST bookings
    if (req.method === "POST" && req.path === "/api/bookings") {
      const { parkingId, startTime, endTime } = req.body;
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: req.user?.id || null,
        parkingId,
        startTime,
        endTime,
      };
      fs.appendFile(logFile, JSON.stringify(logEntry) + "\n", err => {
        if (err) console.error("Failed to log booking:", err);
      });
    }
  } catch (err) {
    console.error("Usage logger error:", err);
  }
  next();
};

module.exports = usageLogger;