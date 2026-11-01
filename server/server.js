const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = require("./app");
const { connectDB, disconnectDB, getDatabaseInfo } = require("./config/db");

const PORT = parseInt(process.env.PORT, 10) || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOW_OFFLINE_DEMO = process.env.ALLOW_OFFLINE_DEMO === "true";

let serverInstance = null;

/**
 * Predictable, secure server startup lifecycle
 */
async function startServer() {
    console.log("=================================================");
    console.log("  BALAJI COMPUTER MANAGEMENT SYSTEM");
    console.log("  Learn Today, Lead Tomorrow.");
    console.log(`  Environment: ${NODE_ENV.toUpperCase()}`);
    console.log("=================================================");

    // Step 1: Validate essential environment variables
    if (!process.env.JWT_SECRET) {
        console.warn("[Security Warning] JWT_SECRET is not explicitly configured in .env. Using fallback key.");
    }

    // Step 2: Initialize Database Connection
    let isConnected = false;
    try {
        await connectDB();
        isConnected = true;
    } catch (dbError) {
        console.error(`[Database Critical] Unable to establish connection to MongoDB: ${dbError.message}`);

        if (NODE_ENV === "production" || !ALLOW_OFFLINE_DEMO) {
            console.error("\n[FATAL] Startup aborted: MongoDB database is mandatory.");
            console.error("Troubleshooting steps:");
            console.error("  1. Verify the MONGO_URI in server/.env is valid.");
            console.error("  2. If using MongoDB Atlas, verify your IP address is whitelisted (Network Access -> Add IP).");
            console.error("  3. Check that your database user credentials are correct.");
            console.error("  4. For offline frontend development, set ALLOW_OFFLINE_DEMO=true in server/.env.\n");
            process.exit(1);
        }

        console.warn("\n[DEMO MODE ACTIVATED] Starting server with ALLOW_OFFLINE_DEMO=true.");
        console.warn("  • Read endpoints will serve demonstration catalog data.");
        console.warn("  • Database mutation operations (POST/PUT/DELETE) will return HTTP 503.\n");
    }

    // Step 3: Start Express HTTP Server (bind to 0.0.0.0 for Render/Container environments)
    serverInstance = app.listen(PORT, "0.0.0.0", () => {
        const dbInfo = getDatabaseInfo();
        console.log("-------------------------------------------------");
        console.log(` ✓ HTTP Server listening on port: ${PORT}`);
        console.log(` ✓ Base API URL:     http://localhost:${PORT}/api`);
        console.log(` ✓ Health Check URL: http://localhost:${PORT}/api/health`);
        console.log(` ✓ Database Status:  ${isConnected ? `ONLINE (${dbInfo.dbName})` : "OFFLINE DEMO MODE"}`);
        if (isConnected) {
            console.log(` ✓ Target Cluster:   ${dbInfo.maskedUri}`);
        }
        console.log("-------------------------------------------------");
    });

    // Step 4: Register Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
        console.log(`\n[Shutdown] Received ${signal}. Initiating graceful shutdown...`);

        if (serverInstance) {
            serverInstance.close(async () => {
                console.log("[Shutdown] HTTP server closed.");
                try {
                    await disconnectDB();
                } catch (err) {
                    console.error("[Shutdown Error] Error closing database connection:", err.message);
                }
                console.log("[Shutdown] Balaji Computer backend service exited cleanly.");
                process.exit(0);
            });

            // Force termination if clean shutdown hangs over 8 seconds
            setTimeout(() => {
                console.error("[Shutdown Timeout] Could not close connections in time. Forcefully terminating.");
                process.exit(1);
            }, 8000).unref();
        } else {
            process.exit(0);
        }
    };

    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

startServer();
