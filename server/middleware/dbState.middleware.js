const mongoose = require("mongoose");

/**
 * Middleware that validates database availability for incoming API requests.
 * - In live mode (database connected): Passes through smoothly.
 * - If database is disconnected:
 *   - Mutation requests (POST, PUT, PATCH, DELETE) are blocked with HTTP 503 Service Unavailable.
 *   - Read requests (GET) receive an explicit X-Database-Mode: offline header.
 */
const checkDatabaseState = (req, res, next) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    // Public health check and root endpoints are always accessible
    if (req.path === "/health" || req.path === "/api/health" || req.path === "/") {
        return next();
    }

    if (!isDbConnected) {
        const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase());
        const isDemoAllowed = process.env.ALLOW_OFFLINE_DEMO === "true";

        if (isMutation) {
            return res.status(503).json({
                success: false,
                msg: "Database service is currently unavailable. Data creation, update, and deletion operations are disabled.",
                status: 503,
                isDemoMode: isDemoAllowed,
                timestamp: new Date().toISOString(),
            });
        }

        // For GET requests when demo mode is enabled
        if (isDemoAllowed) {
            res.setHeader("X-Database-Mode", "offline-demo");
            req.isOfflineDemo = true;
            return next();
        }

        // If demo mode is not enabled and DB is disconnected, block read requests as well
        return res.status(503).json({
            success: false,
            msg: "Database service is unavailable. Please verify MongoDB connection.",
            status: 503,
            timestamp: new Date().toISOString(),
        });
    }

    res.setHeader("X-Database-Mode", "online");
    req.isOfflineDemo = false;
    next();
};

module.exports = {
    checkDatabaseState,
};

