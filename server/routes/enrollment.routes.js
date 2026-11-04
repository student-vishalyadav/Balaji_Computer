const express = require("express");
const router = express.Router();
const {
    requestEnrollment,
    getMyRequests,
    getCourseEnrollmentStatus,
} = require("../controllers/enrollment.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Student endpoints require authentication and student or admin role
router.use(verifyToken);

router.post("/request", authorizeRoles("student", "admin"), requestEnrollment);
router.get("/my-requests", authorizeRoles("student", "admin"), getMyRequests);
router.get("/status/:courseId", authorizeRoles("student", "admin"), getCourseEnrollmentStatus);

module.exports = router;
