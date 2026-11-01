const express = require("express");
const router = express.Router();
const {
    getAllBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchStudents,
    transferStudent,
} = require("../controllers/batch.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public listing
router.get("/", getAllBatches);

// Admin protected endpoints
router.post("/", verifyToken, authorizeRoles("admin"), createBatch);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateBatch);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteBatch);
router.get("/:id/students", verifyToken, authorizeRoles("admin"), getBatchStudents);
router.post("/transfer", verifyToken, authorizeRoles("admin"), transferStudent);

module.exports = router;
