const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Notice title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Notice description is required"],
        },
        attachment: {
            type: String,
            default: "",
        },
        publishDate: {
            type: Date,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
        },
        targetAudience: {
            type: String,
            enum: ["All Students", "Specific Course", "Specific Batch", "Faculty"],
            default: "All Students",
        },
        targetDetail: {
            type: String,
            default: "",
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal",
        },
        createdBy: {
            type: String,
            default: "Admin",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);

