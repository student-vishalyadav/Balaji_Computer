const express = require("express");
const router = express.Router();
const { signup, login, logout, getMe } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Public auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected profile route
router.get("/me", verifyToken, getMe);

module.exports = router;

