const mongoose = require("mongoose");

const enrollmentRequestSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: [true, "Student reference is required"],
            index: true,
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        studentEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        studentMobile: {
            type: String,
            trim: true,
            default: "",
        },
        studentCode: {
            type: String,
            trim: true,
            default: "",
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course reference is required"],
            index: true,
        },
        courseTitle: {
            type: String,
            required: true,
            trim: true,
        },
        courseCode: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },
        courseFee: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
            default: "PENDING",
            index: true,
        },
        requestDate: {
            type: Date,
            default: Date.now,
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        reviewedByName: {
            type: String,
            default: "",
        },
        reviewedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
        },
        courseAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseAssignment",
        },
    },
    { timestamps: true }
);

// Compound index to optimize queries by student and status
enrollmentRequestSchema.index({ studentId: 1, status: 1 });
enrollmentRequestSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model("EnrollmentRequest", enrollmentRequestSchema);
