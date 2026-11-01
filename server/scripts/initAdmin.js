require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/Balajicomputer";

async function initAdmin() {
    console.log("=== Balaji Computer: Admin Account Initialization ===");

    const adminName = process.env.ADMIN_NAME || "Administrator";
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@balajicomputer.edu").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error("ERROR: ADMIN_PASSWORD environment variable is not defined in server/.env");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB at:", MONGO_URI);

        const existingAdmin = await userModel.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Administrator account (${adminEmail}) already exists.`);
            // Ensure role is admin
            if (existingAdmin.role !== "admin") {
                existingAdmin.role = "admin";
                await existingAdmin.save();
                console.log(`Updated role to 'admin' for ${adminEmail}.`);
            }
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await userModel.create({
                username: "admin",
                fullName: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                isActive: true,
                mobile: "+91 98765 43210",
                mustChangePassword: true,
            });
            console.log(`Admin account created successfully!`);
            console.log(`Email: ${adminEmail}`);
            console.log(`Role: admin`);
            console.log(`Status: Active (Change password required on first login)`);
        }
    } catch (error) {
        console.error("Failed to initialize admin account:", error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

initAdmin();

