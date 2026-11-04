const express = require("express");
const router = express.Router();
const {
    getAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    getStudentNotifications,
    markStudentNotificationRead,
    markAllStudentNotificationsRead,
} = require("../controllers/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.use(verifyToken);

// Admin notification routes
router.get("/admin", authorizeRoles("admin"), getAdminNotifications);
router.patch("/admin/read-all", authorizeRoles("admin"), markAllAdminNotificationsRead);
router.patch("/admin/:id/read", authorizeRoles("admin"), markAdminNotificationRead);

// Student notification routes
router.get("/student", authorizeRoles("student", "admin"), getStudentNotifications);
router.patch("/student/read-all", authorizeRoles("student", "admin"), markAllStudentNotificationsRead);
router.patch("/student/:id/read", authorizeRoles("student", "admin"), markStudentNotificationRead);

module.exports = router;
