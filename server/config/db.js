const mongoose = require("mongoose");
const path = require("path");
const { sanitizeMongoUri } = require("./mongoUriHelper");

// Explicitly load server/.env regardless of current working directory
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

let connectionPromise = null;
let listenersAttached = false;
let connectionDiagnostics = {
    connectedAt: null,
    maskedUri: "",
    isSrv: false,
    dbName: "",
    errorCount: 0,
    lastError: null,
};

/**
 * Configure global Mongoose connection event listeners once
 */
function attachConnectionListeners() {
    if (listenersAttached) return;
    listenersAttached = true;

    mongoose.connection.on("connected", () => {
        connectionDiagnostics.connectedAt = new Date();
        console.log(`[Database] MongoDB connection established successfully (db: ${mongoose.connection.name})`);
    });

    mongoose.connection.on("error", (err) => {
        connectionDiagnostics.errorCount++;
        connectionDiagnostics.lastError = err.message;

        // Diagnostic user-friendly logging without leaking credentials
        if (err.message && err.message.includes("bad auth")) {
            console.error("[Database Error] Authentication Failed: Invalid database username or password in MONGO_URI.");
        } else if (err.message && (err.message.includes("querySrv ENOTFOUND") || err.message.includes("getaddrinfo ENOTFOUND"))) {
            console.error("[Database Error] DNS Resolution Failed: MongoDB cluster host not found. Verify network access and cluster hostname.");
        } else if (err.message && (err.message.includes("timed out") || err.message.includes("Server selection"))) {
            console.error("[Database Error] Connection Timed Out: Cluster unreachable. Check if your current IP address is whitelisted in MongoDB Atlas.");
        } else {
            console.error("[Database Error] Mongoose connection error:", err.message);
        }
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("[Database Warning] MongoDB connection lost / disconnected.");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("[Database] MongoDB connection re-established.");
    });
}

/**
 * Connect to MongoDB with URI sanitization, credential masking, and singleton lifecycle
 */
async function connectDB(overrideUri = null) {
    // 1. If already connected, return existing Mongoose instance
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    // 2. If connection is already in progress, return the pending promise (prevents duplicate calls)
    if (connectionPromise && (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 1)) {
        return connectionPromise;
    }

    // 3. Resolve connection URI
    const rawUri = overrideUri || process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Balajicomputer";

    const parsed = sanitizeMongoUri(rawUri);
    if (!parsed.isValid) {
        const errorMsg = `[Database Configuration Error] ${parsed.error}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Warn if a port was stripped from an SRV URI
    if (parsed.hadPortRemoved) {
        console.warn(
            `[Database Warning] Removed invalid port number from '${parsed.originalHostWithPort}'. The mongodb+srv:// protocol uses DNS SRV records and cannot specify a port.`
        );
    }

    connectionDiagnostics.maskedUri = parsed.maskedUri;
    connectionDiagnostics.isSrv = parsed.isSrv;
    connectionDiagnostics.dbName = parsed.dbName;

    // Attach lifecycle event listeners once
    attachConnectionListeners();

    // 4. Execute connection with safe timeouts
    console.log(`[Database] Connecting to MongoDB: ${parsed.maskedUri}`);

    connectionPromise = (async () => {
        try {
            await mongoose.connect(parsed.cleanUri, {
                serverSelectionTimeoutMS: 5000, // 5 second timeout to fail fast if unreachable
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
            });

            console.log(`[Database] Successfully verified MongoDB connection to: ${parsed.maskedUri}`);
            return mongoose;
        } catch (error) {
            // Reset connection promise so subsequent attempts can retry cleanly
            connectionPromise = null;
            throw error;
        }
    })();

    return connectionPromise;
}

/**
 * Gracefully disconnect from MongoDB
 */
async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        try {
            await mongoose.connection.close(false);
            console.log("[Database] Mongoose connection closed gracefully.");
        } catch (err) {
            console.error("[Database Error] Error during disconnect:", err.message);
        } finally {
            connectionPromise = null;
        }
    }
}

/**
 * Check if active database connection is ready
 */
function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

/**
 * Get sanitized diagnostics for health check and admin monitoring
 */
function getDatabaseInfo() {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const readyState = mongoose.connection.readyState;
    return {
        state: states[readyState] || "unknown",
        isConnected: readyState === 1,
        maskedUri: connectionDiagnostics.maskedUri,
        isSrv: connectionDiagnostics.isSrv,
        dbName: mongoose.connection.name || connectionDiagnostics.dbName,
        connectedAt: connectionDiagnostics.connectedAt,
        errorCount: connectionDiagnostics.errorCount,
        lastError: connectionDiagnostics.lastError,
    };
}

module.exports = mongoose;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.isDatabaseConnected = isDatabaseConnected;
module.exports.getDatabaseInfo = getDatabaseInfo;
