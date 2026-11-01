const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { connectDB, disconnectDB } = require("../config/db");

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
        await connectDB();

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
        await disconnectDB();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

initAdmin();

