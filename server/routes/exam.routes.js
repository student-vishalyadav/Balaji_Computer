const express = require("express");
const router = express.Router();
const {
    getAllExams,
    createExam,
    updateExam,
    publishResults,
    deleteExam,
} = require("../controllers/exam.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Exams listing
router.get("/", verifyToken, getAllExams);

// Admin-only exam management
router.post("/", verifyToken, authorizeRoles("admin"), createExam);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateExam);
router.post("/:id/publish", verifyToken, authorizeRoles("admin"), publishResults);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteExam);

module.exports = router;
