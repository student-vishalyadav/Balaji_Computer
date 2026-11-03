const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Public auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Password recovery routes (Public)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password", resetPassword);

// Protected profile route
router.get("/me", verifyToken, getMe);

module.exports = router;

