const mongoose = require("mongoose");

const courseAssignmentSchema = new mongoose.Schema(
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
        courseImage: {
            type: String,
            default: "",
        },
        courseDescription: {
            type: String,
            default: "",
        },
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: [true, "Batch reference is required"],
            index: true,
        },
        batchName: {
            type: String,
            required: true,
            trim: true,
        },
        instructorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        instructorName: {
            type: String,
            required: true,
            trim: true,
            default: "Certified Lab Instructor",
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"],
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"],
        },
        timing: {
            type: String,
            required: [true, "Class timing is required"],
            trim: true,
            default: "09:00 AM - 11:00 AM",
        },
        classDays: {
            type: String,
            required: [true, "Class days are required"],
            trim: true,
            default: "Monday - Saturday",
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
            trim: true,
            default: "6 Months",
        },
        status: {
            type: String,
            enum: ["ACTIVE", "COMPLETED", "SUSPENDED", "CANCELLED"],
            default: "ACTIVE",
            index: true,
        },
        enrollmentRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EnrollmentRequest",
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        assignedByName: {
            type: String,
            default: "Admin",
        },
        completedTopics: [
            {
                type: String,
                trim: true,
            },
        ],
        pendingTopics: [
            {
                type: String,
                trim: true,
            },
        ],
        progressPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

courseAssignmentSchema.index({ studentId: 1, status: 1 });
courseAssignmentSchema.index({ batchId: 1, status: 1 });
courseAssignmentSchema.index({ courseId: 1, status: 1 });

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema);
