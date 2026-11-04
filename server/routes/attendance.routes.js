const express = require("express");
const router = express.Router();
const {
    getBatchAttendance,
    saveAttendance,
    getAttendanceReport,
    updateAttendanceById,
} = require("../controllers/attendance.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Enforce authentication for faculty and admin
router.use(verifyToken, authorizeRoles("admin", "faculty"));

// Batch attendance roster query
router.get("/", getBatchAttendance);
router.get("/batch", getBatchAttendance);

// Mark / save attendance
router.post("/", saveAttendance);
router.post("/mark", saveAttendance);
router.post("/save", saveAttendance);

// Attendance reports
router.get("/reports", getAttendanceReport);
router.get("/report", getAttendanceReport);

// Update single attendance record
router.patch("/:id", updateAttendanceById);

module.exports = router;
