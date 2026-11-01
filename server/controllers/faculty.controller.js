const userModel = require("../models/userModel");
const auditLogModel = require("../models/auditLogModel");
const bcrypt = require("bcrypt");

// Get all faculty
const getAllFaculty = async (req, res) => {
    try {
        const { search, status } = req.query;
        const query = { role: "faculty" };

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [{ fullName: regex }, { email: regex }, { mobile: regex }, { specialization: regex }];
        }

        if (status && status !== "all") {
            query.isActive = status === "active";
        }

        const facultyList = await userModel.find(query).sort({ createdAt: -1 }).select("-password");

        return res.status(200).json({
            success: true,
            faculty: facultyList,
            count: facultyList.length,
        });
    } catch (error) {
        console.error("Error in getAllFaculty:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch faculty list" });
    }
};

// Add new faculty
const addFaculty = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobile,
            password,
            gender,
            qualification,
            experience,
            specialization,
            assignedCourses = [],
            assignedBatches = [],
            isActive = true,
        } = req.body;

        if (!fullName || !email || !mobile) {
            return res.status(400).json({
                success: false,
                msg: "Full Name, Email, and Mobile number are required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existing = await userModel.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(400).json({
                success: false,
                msg: "An account with this email address already exists",
            });
        }

        const rawPassword = password || "Faculty@123";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newFaculty = await userModel.create({
            username: cleanEmail.split("@")[0],
            fullName: fullName.trim(),
            email: cleanEmail,
            mobile: mobile.trim(),
            password: hashedPassword,
            role: "faculty",
            gender: gender || "",
            qualification: qualification || "",
            experience: experience || "",
            specialization: specialization || "",
            assignedCourses: Array.isArray(assignedCourses) ? assignedCourses : [assignedCourses].filter(Boolean),
            assignedBatches: Array.isArray(assignedBatches) ? assignedBatches : [assignedBatches].filter(Boolean),
            isActive: isActive !== false,
        });

        await auditLogModel.create({
            action: "ADD_FACULTY",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Faculty",
            targetId: String(newFaculty._id),
            details: `Added new faculty member ${newFaculty.fullName} (${newFaculty.specialization})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Faculty member ${fullName} added successfully.`,
            faculty: newFaculty,
        });
    } catch (error) {
        console.error("Error in addFaculty:", error);
        return res.status(500).json({ success: false, msg: error.message || "Failed to add faculty" });
    }
};

// Update faculty
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates.password;
        delete updates.role;

        const faculty = await userModel.findOneAndUpdate({ _id: id, role: "faculty" }, updates, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!faculty) {
            return res.status(404).json({ success: false, msg: "Faculty member not found" });
        }

        await auditLogModel.create({
            action: "UPDATE_FACULTY",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Faculty",
            targetId: String(faculty._id),
            details: `Updated faculty member ${faculty.fullName}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: "Faculty details updated successfully",
            faculty,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update faculty" });
    }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const faculty = await userModel.findOneAndDelete({ _id: id, role: "faculty" });

        if (!faculty) {
            return res.status(404).json({ success: false, msg: "Faculty not found" });
        }

        await auditLogModel.create({
            action: "DELETE_FACULTY",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Faculty",
            targetId: String(faculty._id),
            details: `Removed faculty member ${faculty.fullName}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Faculty member ${faculty.fullName} removed successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete faculty" });
    }
};

module.exports = {
    getAllFaculty,
    addFaculty,
    updateFaculty,
    deleteFaculty,
};

