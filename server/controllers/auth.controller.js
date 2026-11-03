const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/email.service");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}

// Helper to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role || "student",
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Helper to configure cookie options
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Signup (Registration)
const signup = async (req, res) => {
    try {
        let { username, fullName, email, password, age, mobile, course, gender } = req.body;

        // Support either fullName or username (or both)
        const displayName = (fullName || username || "").trim();
        if (!displayName) {
            return res.status(400).json({ success: false, msg: "Full Name is required" });
        }

        if (!email) {
            return res.status(400).json({ success: false, msg: "Email address is required" });
        }

        if (!password) {
            return res.status(400).json({ success: false, msg: "Password is required" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Password must be at least 6 characters long",
            });
        }

        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, msg: "Please provide a valid email address" });
        }

        const exist_user = await userModel.findOne({ email });
        if (exist_user) {
            return res.status(400).json({
                success: false,
                msg: "An account with this email is already registered. Please log in.",
            });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        // Security rule: Always assign student role on server
        const newuser = await userModel.create({
            username: username ? username.trim() : displayName,
            fullName: displayName,
            email,
            password: hashpassword,
            age: age ? Number(age) : 18,
            mobile: mobile ? mobile.trim() : "",
            course: course ? course.trim() : "",
            gender: gender || "",
            role: "student", // Strictly enforce student role
            isActive: true,
        });

        const token = generateToken(newuser);
        res.cookie("token", token, getCookieOptions());

        return res.status(201).json({
            success: true,
            msg: "Registration successful! Welcome to Balaji Computer.",
            token,
            user: {
                _id: newuser._id,
                username: newuser.username,
                fullName: newuser.fullName,
                email: newuser.email,
                role: newuser.role,
                mobile: newuser.mobile,
                course: newuser.course,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            msg: "Error during registration. Please try again later.",
        });
    }
};

// Login
const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Email and password are required",
            });
        }

        email = email.trim().toLowerCase();
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                msg: "Your account is inactive. Please contact administration.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password",
            });
        }

        const token = generateToken(user);
        res.cookie("token", token, getCookieOptions());

        return res.status(200).json({
            success: true,
            msg: "Login successful",
            token,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName || user.username,
                email: user.email,
                role: user.role || "student",
                mobile: user.mobile || "",
                course: user.course || "",
                avatar: user.avatar || "",
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            msg: "Server error during login. Please try again.",
        });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.status(200).json({
            success: true,
            msg: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error logging out",
        });
    }
};

// Get current authenticated user profile
const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }
        return res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                fullName: user.fullName || user.username,
                email: user.email,
                role: user.role || "student",
                mobile: user.mobile || "",
                course: user.course || "",
                gender: user.gender || "",
                avatar: user.avatar || "",
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching user profile",
        });
    }
};

// Forgot Password Request
const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                msg: "Please provide your registered email address.",
            });
        }

        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                msg: "Please provide a valid email address.",
            });
        }

        const genericSuccessMsg =
            "If an account exists with this email address, a password reset link has been sent.";

        const user = await userModel.findOne({ email });

        // Anti-enumeration: Return generic message if user doesn't exist
        if (!user) {
            return res.status(200).json({
                success: true,
                msg: genericSuccessMsg,
            });
        }

        if (!user.isActive) {
            return res.status(200).json({
                success: true,
                msg: genericSuccessMsg,
            });
        }

        // Generate cryptographically secure random token (32 bytes = 64 hex chars)
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Hash token with SHA-256 before database storage
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Set token and 15-minute expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Construct reset link using primary configured CLIENT_URL
        const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
            .split(",")[0]
            .trim()
            .replace(/\/$/, "");
        const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

        try {
            await sendPasswordResetEmail({
                to: user.email,
                name: user.fullName || user.username || "Member",
                resetUrl,
            });
        } catch (mailError) {
            console.error("[Email Dispatch Error] Failed to send password reset email:", mailError.message);
            // Clear token to avoid dangling active token upon send failure
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                msg: "Failed to dispatch password reset email. Please contact institute administration.",
            });
        }

        return res.status(200).json({
            success: true,
            msg: genericSuccessMsg,
        });
    } catch (error) {
        console.error("[Forgot Password Error]:", error);
        return res.status(500).json({
            success: false,
            msg: "An error occurred while processing your password reset request. Please try again later.",
        });
    }
};

// Reset Password with Token
const resetPassword = async (req, res) => {
    try {
        const rawToken = req.params.token || req.body.token;
        const { password, confirmPassword } = req.body;

        if (!rawToken) {
            return res.status(400).json({
                success: false,
                msg: "Password reset token is missing.",
            });
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Please provide both new password and confirmation password.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Passwords do not match.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                msg: "Password must be at least 6 characters long.",
            });
        }

        // Hash the incoming raw token with SHA-256 to compare against the hashed token in MongoDB
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        // Find user with matching unexpired token
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Invalid or expired password reset link. Please request a new one.",
            });
        }

        // Hash new password using bcrypt salt rounds 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and invalidate reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.mustChangePassword = false;
        await user.save();

        return res.status(200).json({
            success: true,
            msg: "Password has been reset successfully. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("[Reset Password Error]:", error);
        return res.status(500).json({
            success: false,
            msg: "An error occurred while resetting your password. Please try again later.",
        });
    }
};

module.exports = { signup, login, logout, getMe, forgotPassword, resetPassword };
