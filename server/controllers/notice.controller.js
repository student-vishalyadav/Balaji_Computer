const noticeModel = require("../models/noticeModel");
const auditLogModel = require("../models/auditLogModel");

// Get all notices
const getAllNotices = async (req, res) => {
    try {
        const { audience, publishedOnly } = req.query;
        const query = {};

        if (audience && audience !== "all") {
            query.targetAudience = audience;
        }

        if (publishedOnly === "true") {
            query.isPublished = true;
        }

        const notices = await noticeModel.find(query).sort({ publishDate: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            notices,
            count: notices.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to fetch notices" });
    }
};

// Create Notice
const createNotice = async (req, res) => {
    try {
        const { title, description, targetAudience = "All Students", targetDetail = "", priority = "normal", expiryDate, attachment } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, msg: "Title and Description are required" });
        }

        const newNotice = await noticeModel.create({
            title: title.trim(),
            description: description.trim(),
            targetAudience,
            targetDetail: targetDetail || "",
            priority,
            publishDate: new Date(),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            attachment: attachment || "",
            isPublished: true,
            createdBy: req.user?.fullName || "Admin",
        });

        await auditLogModel.create({
            action: "CREATE_NOTICE",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Notice",
            targetId: String(newNotice._id),
            details: `Published announcement "${newNotice.title}" to ${newNotice.targetAudience}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Notice "${newNotice.title}" published successfully.`,
            notice: newNotice,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message || "Failed to create notice" });
    }
};

// Update Notice
const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await noticeModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updated) {
            return res.status(404).json({ success: false, msg: "Notice not found" });
        }

        return res.status(200).json({
            success: true,
            msg: "Notice updated successfully",
            notice: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update notice" });
    }
};

// Toggle Publish
const togglePublishNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await noticeModel.findById(id);

        if (!notice) {
            return res.status(404).json({ success: false, msg: "Notice not found" });
        }

        notice.isPublished = !notice.isPublished;
        await notice.save();

        return res.status(200).json({
            success: true,
            msg: `Notice is now ${notice.isPublished ? "Visible" : "Hidden"}.`,
            isPublished: notice.isPublished,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update notice status" });
    }
};

// Delete Notice
const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;
        const notice = await noticeModel.findByIdAndDelete(id);

        if (!notice) {
            return res.status(404).json({ success: false, msg: "Notice not found" });
        }

        return res.status(200).json({
            success: true,
            msg: `Notice "${notice.title}" deleted successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete notice" });
    }
};

module.exports = {
    getAllNotices,
    createNotice,
    updateNotice,
    togglePublishNotice,
    deleteNotice,
};

