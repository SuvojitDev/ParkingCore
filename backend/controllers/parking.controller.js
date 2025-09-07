// controllers/parking.controller.js
const Parking = require("../models/Parking");
const axios = require("axios");

exports.createSlot = async (req, res) => {
  const { code, managerId, location, type = "Car", pricePerHour = 0 } = req.body;
  if (!code || !managerId || !location) {
    return res.status(400).json({ message: "Slot code, managerId, and location are required" });
  }
  try {
    const existingSlot = await Parking.findOne({ code });
    if (existingSlot) {
      return res.status(409).json({ message: "A slot with this code already exists" });
    }
    // geocode via OSM
    const geoRes = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: location, format: "json", limit: 1 },
      headers: { "User-Agent": "ParkingApp/1.0 (suvojit.modak109@gmail.com)" }
    });
    if (!geoRes.data || geoRes.data.length === 0) {
      return res.status(400).json({ message: "Invalid location, could not geocode" });
    }
    const { lat, lon } = geoRes.data[0];
    const slot = await Parking.create({
      code,
      managerId,
      location,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      locationPoint: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
      type,
      pricePerHour: parseFloat(pricePerHour) || 0
    });
    res.status(201).json(slot);
  } catch (error) {
    console.error(error);
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
  const { code, managerId, location, type, pricePerHour } = req.body;

  try {
    const updateData = {};

    if (code) updateData.code = code;
    if (managerId) updateData.managerId = managerId;
    if (location) updateData.location = location;
    if (type) updateData.type = type;
    if (pricePerHour !== undefined) updateData.pricePerHour = pricePerHour;

    const slot = await Parking.findByIdAndUpdate(id, updateData, { new: true });

    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.json(slot);
  } catch (error) {
    console.error(error);
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

exports.getAllParkingSlots = async (req, res) => {
  try {
    const slots = await Parking.find().select('_id code'); // only id & code
    res.status(200).json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};