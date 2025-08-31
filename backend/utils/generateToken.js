// utils/generateToken.js
const jwt = require("jsonwebtoken");

module.exports = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "7d" });

