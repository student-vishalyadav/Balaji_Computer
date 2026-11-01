const express = require("express");
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
} = require("../controllers/course.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public endpoints
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

// Protected Admin endpoints
router.post("/", verifyToken, authorizeRoles("admin"), createCourse);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateCourse);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteCourse);

module.exports = router;

