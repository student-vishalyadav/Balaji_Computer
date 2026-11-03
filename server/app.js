const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const { checkDatabaseState } = require("./middleware/dbState.middleware");
const { getDatabaseInfo } = require("./config/db");

// Route Handlers
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const studentRoutes = require("./routes/student.routes");
const facultyRoutes = require("./routes/faculty.routes");
const courseRoutes = require("./routes/course.routes");
const batchRoutes = require("./routes/batch.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const feeRoutes = require("./routes/fee.routes");
const examRoutes = require("./routes/exam.routes");
const materialRoutes = require("./routes/material.routes");
const noticeRoutes = require("./routes/notice.routes");
const instituteRoutes = require("./routes/institute.routes");

const app = express();

// Trust reverse proxy (essential for Render / Heroku / Nginx for rate-limiting & IP tracking)
app.set("trust proxy", 1);

// Security Headers with Helmet
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // Managed by frontend hosting
    })
);

// CORS allows local development origins and explicitly configured frontends.
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = new Set();

if (!isProduction) {
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ].forEach((origin) => allowedOrigins.add(origin));
}

for (const configuredOrigins of [process.env.CLIENT_URL, process.env.FRONTEND_URL]) {
    if (!configuredOrigins) continue;

    for (const configuredOrigin of configuredOrigins.split(",")) {
        const trimmedOrigin = configuredOrigin.trim();
        if (!trimmedOrigin) continue;

        try {
            const parsedOrigin = new URL(trimmedOrigin);
            if (["http:", "https:"].includes(parsedOrigin.protocol)) {
                allowedOrigins.add(parsedOrigin.origin);
            }
        } catch {
            console.warn("[CORS] Ignoring an invalid CLIENT_URL / FRONTEND_URL entry.");
        }
    }
}

if (isProduction && allowedOrigins.size === 0) {
    throw new Error("Set CLIENT_URL to the deployed frontend origin in production.");
}

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps, curl, postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin) || !isProduction) {
                return callback(null, true);
            }
            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
);

// Rate Limiting Protection
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 400, // limit each IP to 400 requests per 15 mins
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        msg: "Too many requests from this IP. Please try again after 15 minutes.",
        status: 429,
    },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // stricter limit for login/registration to prevent brute-force
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        msg: "Too many authentication attempts. Please try again after 15 minutes.",
        status: 429,
    },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);

// Payload size limits to prevent memory exhaustion attacks
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Root test endpoint
app.get("/", (req, res) => {
    res.send("Balaji Computer Coaching Institute API is running smoothly!");
});

// Health check
app.get("/api/health", (req, res) => {
    const dbInfo = getDatabaseInfo();
    const isHealthy = dbInfo.isConnected;

    res.status(isHealthy || process.env.ALLOW_OFFLINE_DEMO === "true" ? 200 : 503).json({
        success: isHealthy,
        institute: "Balaji Computer",
        tagline: "Learn Today, Lead Tomorrow.",
        status: isHealthy ? "Online" : "Degraded",
        database: {
            status: dbInfo.state,
            connected: dbInfo.isConnected,
            name: dbInfo.dbName,
            target: dbInfo.maskedUri,
            mode: dbInfo.isConnected ? "live" : (process.env.ALLOW_OFFLINE_DEMO === "true" ? "offline-demo" : "disconnected"),
        },
        timestamp: new Date().toISOString(),
    });
});

// Guard API mutation and database-dependent routes when disconnected
app.use("/api", checkDatabaseState);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/institute", instituteRoutes);
// Direct shortcut endpoints for homepage integrations
app.use("/api", instituteRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
