const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getSettings,
    updateSettings,
    getAuditLogs,
    changePassword,
} = require("../controllers/admin.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Protect all admin routes with authentication & admin role check
router.use(verifyToken, authorizeRoles("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/audit-logs", getAuditLogs);
router.put("/change-password", changePassword);

module.exports = router;
