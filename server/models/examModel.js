const mongoose = require("mongoose");

const examQuestionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
            trim: true,
        },
        options: [
            {
                type: String,
                required: true,
            },
        ],
        correctOptionIndex: {
            type: Number,
            required: true,
            min: 0,
            max: 3,
        },
        marks: {
            type: Number,
            default: 2,
        },
        explanation: {
            type: String,
            default: "",
        },
    },
    { _id: true }
);

const examResultSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        studentName: {
            type: String,
            required: true,
        },
        studentCode: {
            type: String,
            default: "",
        },
        marksObtained: {
            type: Number,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
        },
        percentage: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pass", "fail"],
            default: "pass",
        },
        grade: {
            type: String,
            default: "A",
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Exam title is required"],
            trim: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
        },
        batchName: {
            type: String,
            default: "All Batches",
        },
        durationMinutes: {
            type: Number,
            required: true,
            default: 60,
        },
        totalMarks: {
            type: Number,
            required: true,
            default: 50,
        },
        passingMarks: {
            type: Number,
            required: true,
            default: 20,
        },
        negativeMarks: {
            type: Number,
            default: 0,
        },
        scheduledDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["draft", "scheduled", "completed", "results_published"],
            default: "scheduled",
        },
        questions: [examQuestionSchema],
        results: [examResultSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);

