const express = require("express");
const router = express.Router();
const { getStats, getTestimonials, getFaculty } = require("../controllers/institute.controller");

router.get("/stats", getStats);
router.get("/testimonials", getTestimonials);
router.get("/faculty", getFaculty);

module.exports = router;

