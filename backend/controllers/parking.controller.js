// controllers/parking.controller.js
const Parking = require("../models/Parking");

exports.createSlot = async (req, res) => {
  const { code, managerId, location } = req.body;
  if (!code || !managerId || !location) {
    return res.status(400).json({ message: "Slot code and managerId are required" });
  }
  try {
    const existingSlot = await Parking.findOne({ code });
    if (existingSlot) {
      return res.status(409).json({ message: "A slot with this code already exists" });
    }
    const slot = await Parking.create({ code, managerId, location });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating slot", error });
  }
};

exports.listAllSlots = async (req, res) => {
  try {
    const { status, managerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (managerId) filter.managerId = managerId;

    const slots = await Parking.find(filter).populate('managerId', 'name email').lean();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching slots", error });
  }
};

exports.updateSlot = async (req, res) => {
  const { id } = req.params;
  const { code, managerId, location } = req.body;
  try {
    const slot = await Parking.findByIdAndUpdate(id, { code, managerId, location }, { new: true });
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: "Server error while updating slot", error });
  }
};

exports.deleteSlot = async (req, res) => {
  const { id } = req.params;
  try {
    const slot = await Parking.findByIdAndDelete(id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.status(200).json({ message: "Slot successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting slot", error });
  }
};