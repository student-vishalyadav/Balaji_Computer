const express = require("express");
const router = express.Router();
const {
    getAllNotices,
    createNotice,
    updateNotice,
    togglePublishNotice,
    deleteNotice,
} = require("../controllers/notice.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public notices
router.get("/", getAllNotices);

// Admin-only management
router.post("/", verifyToken, authorizeRoles("admin"), createNotice);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateNotice);
router.patch("/:id/toggle-publish", verifyToken, authorizeRoles("admin"), togglePublishNotice);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteNotice);

module.exports = router;
