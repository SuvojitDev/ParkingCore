// routes/parking.routes.js

const router = require("express").Router();
const { auth } = require("../middleware/auth.middleware");
const { createSlot, listAllSlots, updateSlot, deleteSlot } = require("../controllers/parking.controller");

// Manager & Admin
router.post("/", auth(["Manager", "Admin"]), createSlot);
router.get("/", auth(["Manager", "Admin", "Customer"]), listAllSlots);
router.put("/:id", auth(["Manager", "Admin"]), updateSlot);
router.delete("/:id", auth(["Manager", "Admin"]), deleteSlot);

module.exports = router;