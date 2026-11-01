const express = require("express");
const router = express.Router();
const {
    getAllFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
} = require("../controllers/faculty.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public access for listing
router.get("/", getAllFaculty);

// Admin protected endpoints
router.post("/", verifyToken, authorizeRoles("admin"), addFaculty);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateFaculty);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteFaculty);

module.exports = router;
