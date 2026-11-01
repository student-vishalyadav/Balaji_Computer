const express = require("express");
const router = express.Router();
const {
    getBatchAttendance,
    saveAttendance,
    getAttendanceReport,
} = require("../controllers/attendance.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(verifyToken, authorizeRoles("admin", "faculty"));

router.get("/batch", getBatchAttendance);
router.post("/save", saveAttendance);
router.get("/report", getAttendanceReport);

module.exports = router;
