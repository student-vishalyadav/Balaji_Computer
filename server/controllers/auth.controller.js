const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "haikayatadaphaiyekaisisajajo";

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

module.exports = { signup, login, logout, getMe };
