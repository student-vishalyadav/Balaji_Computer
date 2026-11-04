const express = require("express");
const router = express.Router();
const {
    getStudentDashboard,
    getStudentAttendance,
    getStudentActiveCourses,
} = require("../controllers/studentDashboard.controller");
const {
    getStudentNotifications,
    markStudentNotificationRead,
    markAllStudentNotificationsRead,
} = require("../controllers/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Student endpoints require authentication
router.use(verifyToken, authorizeRoles("student", "admin"));

// Dashboard data
router.get("/dashboard", getStudentDashboard);
router.get("/active-courses", getStudentActiveCourses);
router.get("/attendance", getStudentAttendance);

// Notifications
router.get("/notifications", getStudentNotifications);
router.patch("/notifications/read-all", markAllStudentNotificationsRead);
router.patch("/notifications/:id/read", markStudentNotificationRead);

module.exports = router;
