const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Batch name is required"],
            trim: true,
            unique: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        courseName: {
            type: String,
            required: [true, "Course name is required"],
            trim: true,
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        facultyName: {
            type: String,
            trim: true,
            default: "To Be Assigned",
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        timing: {
            type: String,
            required: [true, "Class timing is required"],
            trim: true,
        },
        maxStudents: {
            type: Number,
            default: 30,
        },
        currentEnrollment: {
            type: Number,
            default: 0,
        },
        classroom: {
            type: String,
            default: "Main Lab",
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "completed", "upcoming"],
            default: "active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);

