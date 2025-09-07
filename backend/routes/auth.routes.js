// routes/auth.routes.js
const router = require("express").Router();
const { register, login, forgotPassword, resetPassword, changePassword  } = require("../controllers/auth.controller");
const { auth } = require('../middleware/auth.middleware');

router.post("/register", register); // first user becomes Admin automatically
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/change-password", auth(["Customer", "Manager", "Admin"]), changePassword);

module.exports = router;