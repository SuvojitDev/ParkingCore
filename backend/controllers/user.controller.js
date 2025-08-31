// controllers/user.controller.js
const User = require("../models/User");

//🔹 Create Manager or Customer (Admin only)
exports.createUser = async (req, res) => {
  const { name, email, password, role = "Customer" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ id: user._id, name, email, role });
};

// 🔹 List All Users (Admin only)
exports.listUsers = async (_req, res) => {
  const users = await User.find().select("-password").lean();
  res.json(users);
};

// 🔹 Update Full User (Admin only)
// 🔹 Update Whole User (Admin only)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Only update password if passed
    if (password && password.trim() !== "") {
      user.password = password;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// 🔹 Update User Role (Admin only)
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// 🔹 Delete User (Admin only)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const del = await User.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: "User not found" });
  res.json({ message: "Deleted" });
};