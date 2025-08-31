// routes/user.routes.js
const router = require("express").Router();
const { auth } = require("../middleware/auth.middleware");
const { createUser, listUsers, updateUser, updateUserRole, deleteUser } = require("../controllers/user.controller");

// Admin only
router.post("/", auth("Admin"), createUser);
router.get("/", auth("Admin"), listUsers);
router.put("/:id", auth("Admin"), updateUser);
router.patch("/:id/role", auth("Admin"), updateUserRole);
router.delete("/:id", auth("Admin"), deleteUser);

module.exports = router;