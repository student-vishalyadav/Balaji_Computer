const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            trim: true,
        },
        performedBy: {
            type: String,
            required: true,
            default: "Admin",
        },
        targetType: {
            type: String,
            required: true,
            enum: ["Student", "Faculty", "Course", "Batch", "Fee", "Exam", "Material", "Notice", "Settings", "Auth"],
        },
        targetId: {
            type: String,
            default: "",
        },
        details: {
            type: String,
            required: true,
        },
        ipAddress: {
            type: String,
            default: "127.0.0.1",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

