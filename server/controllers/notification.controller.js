const mongoose = require("mongoose");
const notificationModel = require("../models/notificationModel");

/**
 * Get notifications for Admin Panel
 * GET /api/admin/notifications
 */
const getAdminNotifications = async (req, res) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            notificationModel
                .find({ recipientRole: { $in: ["admin", "all"] } })
                .sort({ createdAt: -1 })
                .limit(30),
            notificationModel.countDocuments({
                recipientRole: { $in: ["admin", "all"] },
                isRead: false,
            }),
        ]);

        return res.status(200).json({
            success: true,
            unreadCount,
            notifications,
        });
    } catch (error) {
        console.error("Error in getAdminNotifications:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch admin notifications.",
        });
    }
};

/**
 * Mark a single admin notification as read
 * PATCH /api/admin/notifications/:id/read
 */
const markAdminNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid notification ID." });
        }

        const notification = await notificationModel.findByIdAndUpdate(
            id,
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update notification." });
    }
};

/**
 * Mark all admin notifications as read
 * PATCH /api/admin/notifications/read-all
 */
const markAllAdminNotificationsRead = async (req, res) => {
    try {
        await notificationModel.updateMany(
            { recipientRole: { $in: ["admin", "all"] }, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return res.status(200).json({
            success: true,
            msg: "All admin notifications marked as read.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to mark all as read." });
    }
};

/**
 * Get notifications for Student Portal
 * GET /api/student/notifications
 */
const getStudentNotifications = async (req, res) => {
    try {
        const studentId = req.user._id;

        const [notifications, unreadCount] = await Promise.all([
            notificationModel
                .find({
                    $or: [
                        { recipientId: studentId },
                        { recipientRole: "student" },
                        { recipientRole: "all" },
                    ],
                })
                .sort({ createdAt: -1 })
                .limit(20),
            notificationModel.countDocuments({
                $or: [
                    { recipientId: studentId },
                    { recipientRole: "student" },
                    { recipientRole: "all" },
                ],
                isRead: false,
            }),
        ]);

        return res.status(200).json({
            success: true,
            unreadCount,
            notifications,
        });
    } catch (error) {
        console.error("Error in getStudentNotifications:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch student notifications.",
        });
    }
};

/**
 * Mark a single student notification as read
 * PATCH /api/student/notifications/:id/read
 */
const markStudentNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid notification ID." });
        }

        const notification = await notificationModel.findOneAndUpdate(
            {
                _id: id,
                $or: [
                    { recipientId: studentId },
                    { recipientRole: "student" },
                    { recipientRole: "all" },
                ],
            },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update notification." });
    }
};

/**
 * Mark all student notifications as read
 * PATCH /api/student/notifications/read-all
 */
const markAllStudentNotificationsRead = async (req, res) => {
    try {
        const studentId = req.user._id;

        await notificationModel.updateMany(
            {
                $or: [
                    { recipientId: studentId },
                    { recipientRole: "student" },
                    { recipientRole: "all" },
                ],
                isRead: false,
            },
            { isRead: true, readAt: new Date() }
        );

        return res.status(200).json({
            success: true,
            msg: "All notifications marked as read.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to mark all as read." });
    }
};

module.exports = {
    getAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    getStudentNotifications,
    markStudentNotificationRead,
    markAllStudentNotificationsRead,
};
