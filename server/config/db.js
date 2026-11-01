const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/Balajicomputer";

let isConnected = false;

async function connectDB() {
    if (isConnected) return mongoose;
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 3000, // 3s timeout to prevent hanging if service stopped
        });
        isConnected = true;
        console.log("MongoDB connected successfully to:", MONGO_URI);
    } catch (error) {
        console.error("MongoDB connection warning:", error.message);
        console.log("Running in resilient offline mode with fallback course data.");
    }
    return mongoose;
}

// Auto-connect
connectDB();

module.exports = mongoose;
module.exports.connectDB = connectDB;
