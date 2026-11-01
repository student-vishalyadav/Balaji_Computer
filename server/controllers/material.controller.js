const materialModel = require("../models/materialModel");
const auditLogModel = require("../models/auditLogModel");

// Get all study materials
const getAllMaterials = async (req, res) => {
    try {
        const { course, batch, publishedOnly } = req.query;
        const query = {};

        if (course && course !== "all") query.courseName = course;
        if (batch && batch !== "all") query.batchName = batch;
        if (publishedOnly === "true") query.isPublished = true;

        const materials = await materialModel.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            materials,
            count: materials.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to fetch study materials" });
    }
};

// Add / Upload Material
const addMaterial = async (req, res) => {
    try {
        const { title, description, courseName, batchName = "All Batches", fileUrl, fileType = "PDF Document", fileSize = "2.5 MB" } = req.body;

        if (!title || !courseName || !fileUrl) {
            return res.status(400).json({ success: false, msg: "Material Title, Course, and File URL are required" });
        }

        const newMaterial = await materialModel.create({
            title: title.trim(),
            description: description || "",
            courseName: courseName.trim(),
            batchName: batchName || "All Batches",
            fileUrl: fileUrl.trim(),
            fileType,
            fileSize,
            uploadedBy: req.user?.fullName || "Admin",
            isPublished: true,
        });

        await auditLogModel.create({
            action: "ADD_STUDY_MATERIAL",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Material",
            targetId: String(newMaterial._id),
            details: `Uploaded study material "${newMaterial.title}" for ${newMaterial.courseName}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Study material "${newMaterial.title}" added successfully.`,
            material: newMaterial,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message || "Failed to add study material" });
    }
};

// Toggle Publish Status
const togglePublish = async (req, res) => {
    try {
        const { id } = req.params;
        const mat = await materialModel.findById(id);

        if (!mat) {
            return res.status(404).json({ success: false, msg: "Material not found" });
        }

        mat.isPublished = !mat.isPublished;
        await mat.save();

        return res.status(200).json({
            success: true,
            msg: `Material is now ${mat.isPublished ? "Published" : "Unpublished"}.`,
            isPublished: mat.isPublished,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update status" });
    }
};

// Increment download count
const incrementDownload = async (req, res) => {
    try {
        const { id } = req.params;
        const mat = await materialModel.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }, { new: true });
        return res.status(200).json({ success: true, downloadCount: mat?.downloadCount || 0 });
    } catch (error) {
        return res.status(500).json({ success: false });
    }
};

// Delete Material
const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const mat = await materialModel.findByIdAndDelete(id);

        if (!mat) {
            return res.status(404).json({ success: false, msg: "Material not found" });
        }

        return res.status(200).json({
            success: true,
            msg: `Material "${mat.title}" deleted successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete material" });
    }
};

module.exports = {
    getAllMaterials,
    addMaterial,
    togglePublish,
    incrementDownload,
    deleteMaterial,
};

