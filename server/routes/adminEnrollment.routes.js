const express = require("express");
const router = express.Router();
const {
    getAllEnrollments,
    getEnrollmentById,
    approveEnrollment,
    rejectEnrollment,
    createDirectAssignment,
    updateCourseAssignment,
} = require("../controllers/adminEnrollment.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Enforce admin authentication
router.use(verifyToken, authorizeRoles("admin"));

// Enrollment request management endpoints
router.get("/", getAllEnrollments);
router.get("/:id", getEnrollmentById);
router.patch("/:id/approve", approveEnrollment);
router.patch("/:id/reject", rejectEnrollment);

// Course assignments endpoints
router.post("/assignments", createDirectAssignment);
router.patch("/assignments/:id", updateCourseAssignment);

module.exports = router;
