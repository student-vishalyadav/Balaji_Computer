const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        fullName: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
            required: false,
            default: 18,
        },
        mobile: {
            type: String,
            trim: true,
            default: "",
        },
        course: {
            type: String,
            trim: true,
            default: "",
        },
        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer_not_to_say", ""],
            default: "",
        },
        role: {
            type: String,
            enum: ["student", "faculty", "admin"],
            default: "student",
        },
        avatar: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Student specific fields
        studentId: {
            type: String,
            sparse: true,
            trim: true,
            uppercase: true,
        },
        dob: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        city: {
            type: String,
            default: "",
        },
        state: {
            type: String,
            default: "",
        },
        pinCode: {
            type: String,
            default: "",
        },
        parentName: {
            type: String,
            default: "",
        },
        parentPhone: {
            type: String,
            default: "",
        },
        admissionDate: {
            type: Date,
            default: Date.now,
        },
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
        },
        batchName: {
            type: String,
            default: "",
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        totalFee: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        netFee: {
            type: Number,
            default: 0,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        remainingBalance: {
            type: Number,
            default: 0,
        },
        feeStatus: {
            type: String,
            enum: ["paid", "partial", "pending", "overdue"],
            default: "pending",
        },
        // Admin-Controlled Course Enrollment Status
        enrollmentStatus: {
            type: String,
            enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
            default: "NONE",
            index: true,
        },
        activeAssignmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseAssignment",
        },
        // Faculty specific fields
        qualification: {
            type: String,
            default: "",
        },
        experience: {
            type: String,
            default: "",
        },
        specialization: {
            type: String,
            default: "",
        },
        assignedCourses: [
            {
                type: String,
            },
        ],
        assignedBatches: [
            {
                type: String,
            },
        ],
        mustChangePassword: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
        },
        // Password Reset Security Fields (SHA-256 hashed token & expiry)
        resetPasswordToken: {
            type: String,
            default: undefined,
            index: true,
        },
        resetPasswordExpires: {
            type: Date,
            default: undefined,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
