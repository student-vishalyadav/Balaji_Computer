const express = require("express");
const router = express.Router();
const {
    getAllMaterials,
    addMaterial,
    togglePublish,
    incrementDownload,
    deleteMaterial,
} = require("../controllers/material.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Students and Admin can view materials
router.get("/", verifyToken, getAllMaterials);
router.patch("/:id/download", verifyToken, incrementDownload);

// Admin-only operations
router.post("/", verifyToken, authorizeRoles("admin"), addMaterial);
router.patch("/:id/toggle-publish", verifyToken, authorizeRoles("admin"), togglePublish);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteMaterial);

module.exports = router;
