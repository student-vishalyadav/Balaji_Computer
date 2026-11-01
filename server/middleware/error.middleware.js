const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        msg: `Route not found: ${req.originalUrl}`,
    });
};

const errorHandler = (err, req, res, next) => {
    console.error("Unhandled Error:", err);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || "Internal Server Error";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(", ");
    } else if (err.code && err.code === 11000) {
        statusCode = 400;
        message = "Duplicate value entered. Account with this field already exists.";
    }

    res.status(statusCode).json({
        success: false,
        msg: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };

