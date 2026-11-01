const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
        },
        code: {
            type: String,
            required: [true, "Course code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            required: [true, "Short description is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Full description is required"],
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
            trim: true,
        },
        fee: {
            type: Number,
            required: [true, "Fee is required"],
            min: 0,
        },
        discountFee: {
            type: Number,
            default: 0,
        },
        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
            default: "Beginner",
        },
        category: {
            type: String,
            default: "Computer Applications",
        },
        image: {
            type: String,
            default: "",
        },
        badge: {
            type: String,
            default: "",
        },
        syllabus: [
            {
                type: String,
            },
        ],
        features: [
            {
                type: String,
            },
        ],
        isPopular: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 4.8,
        },
        enrolledCount: {
            type: Number,
            default: 150,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

