const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
    {
        instituteName: {
            type: String,
            default: "Balaji Computer",
        },
        tagline: {
            type: String,
            default: "Learn Today, Lead Tomorrow.",
        },
        email: {
            type: String,
            default: "admissions@balajicomputer.edu",
        },
        phone: {
            type: String,
            default: "+91 98765 43210",
        },
        address: {
            type: String,
            default: "Near Main Market, Coaching Center Hub, Main Road",
        },
        city: {
            type: String,
            default: "City Center",
        },
        state: {
            type: String,
            default: "State",
        },
        pinCode: {
            type: String,
            default: "000000",
        },
        academicSession: {
            type: String,
            default: "2026-2027",
        },
        websiteUrl: {
            type: String,
            default: "https://balajicomputer.edu",
        },
        socialLinks: {
            facebook: { type: String, default: "https://facebook.com" },
            instagram: { type: String, default: "https://instagram.com" },
            youtube: { type: String, default: "https://youtube.com" },
            linkedin: { type: String, default: "https://linkedin.com" },
        },
        feeReceiptPrefix: {
            type: String,
            default: "BC-RCP",
        },
        allowStudentRegistration: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);

