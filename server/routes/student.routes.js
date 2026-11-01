const express = require("express");
const router = express.Router();
const {
    getStudents,
    addStudent,
    getStudentById,
    updateStudent,
    deleteStudent,
    toggleStatus,
    resetPassword,
    bulkUpdateStatus,
} = require("../controllers/student.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Enforce admin authentication
router.use(verifyToken, authorizeRoles("admin"));

router.get("/", getStudents);
router.post("/", addStudent);
router.post("/bulk-status", bulkUpdateStatus);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.patch("/:id/toggle-status", toggleStatus);
router.post("/:id/reset-password", resetPassword);

module.exports = router;
