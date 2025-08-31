// controllers/auth.controller.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Quick bootstrap: if no Admin exists, first register becomes Admin
const ensureFirstAdmin = async () => {
  const count = await User.countDocuments({ role: "Admin" });
  return count === 0;
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const firstSA = await ensureFirstAdmin();
  const finalRole = firstSA ? "Admin" : role || "Customer";

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const user = await User.create({ name, email, password, role: finalRole });
  const token = generateToken({ id: user._id, role: user.role });
  res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await user.matchPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken({ id: user._id, role: user.role });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};