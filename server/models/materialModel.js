const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Material title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        batchName: {
            type: String,
            default: "All Batches",
            trim: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            default: "PDF Document",
        },
        fileSize: {
            type: String,
            default: "2.5 MB",
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        uploadedBy: {
            type: String,
            default: "Admin",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);

