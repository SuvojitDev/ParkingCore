// routes/auth.routes.js
const router = require("express").Router();
const { register, login } = require("../controllers/auth.controller");

router.post("/register", register); // first user becomes Admin automatically
router.post("/login", login);

module.exports = router;