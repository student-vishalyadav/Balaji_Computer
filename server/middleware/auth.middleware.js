const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "haikayatadaphaiyekaisisajajo";

const verifyToken = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Authentication required. Please log in.",
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "User account no longer exists.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                msg: "Your account has been deactivated. Please contact institute administration.",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            msg: "Session expired or invalid token. Please log in again.",
        });
    }
};

module.exports = { verifyToken };

