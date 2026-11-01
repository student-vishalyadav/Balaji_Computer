const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middleware/error.middleware");

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

// Allowed origins for CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8080",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps, curl, postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root test endpoint
app.get("/", (req, res) => {
    res.send("Balaji Computer Coaching Institute API is running smoothly!");
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        institute: "Balaji Computer",
        tagline: "Learn Today, Lead Tomorrow.",
        status: "Online",
        timestamp: new Date().toISOString(),
    });
});

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
