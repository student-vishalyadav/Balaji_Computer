const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        studentName: {
            type: String,
            default: "",
        },
        studentCode: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["present", "absent", "late"],
            default: "present",
        },
        remarks: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { _id: false }
);

const attendanceSchema = new mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },
        batchName: {
            type: String,
            required: true,
            trim: true,
        },
        courseName: {
            type: String,
            default: "",
            trim: true,
        },
        date: {
            type: String, // Stored as YYYY-MM-DD for reliable uniqueness
            required: true,
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        markedByName: {
            type: String,
            default: "Admin",
        },
        totalStudents: {
            type: Number,
            default: 0,
        },
        presentCount: {
            type: Number,
            default: 0,
        },
        absentCount: {
            type: Number,
            default: 0,
        },
        lateCount: {
            type: Number,
            default: 0,
        },
        records: [attendanceRecordSchema],
    },
    { timestamps: true }
);

// Prevent duplicate attendance entries for the same batch and date
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

