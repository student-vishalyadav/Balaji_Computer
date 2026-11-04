const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientRole: {
            type: String,
            enum: ["admin", "student", "faculty", "all"],
            default: "student",
            index: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            index: true,
        },
        type: {
            type: String,
            enum: [
                "ENROLLMENT_REQUEST",
                "ENROLLMENT_APPROVED",
                "ENROLLMENT_REJECTED",
                "SCHEDULE_UPDATED",
                "ATTENDANCE_ALERT",
                "GENERAL",
            ],
            default: "GENERAL",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        link: {
            type: String,
            default: "",
            trim: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        readAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
