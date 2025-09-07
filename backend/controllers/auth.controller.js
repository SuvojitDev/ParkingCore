// controllers/auth.controller.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// 🔹 Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry

    await user.save();

    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
    console.log("Reset URL:", resetUrl);

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click here to reset your password: ${resetUrl}`
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;       // random token from URL
    const { password } = req.body;

    console.log("Reset password request received");
    console.log("Token from URL:", token);
    console.log("New password:", password ? "Provided" : "Not provided");

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // still valid
    }).select("+password");

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("User found:", user.email);

    user.password = password;             // hashed by pre-save hook
    user.resetPasswordToken = undefined;  // remove token after use
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("Password reset successful for user:", user.email);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Change Password (authenticated users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields are required" });

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ message: "Current password incorrect" });

    user.password = newPassword; // hashed automatically by pre-save hook
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

