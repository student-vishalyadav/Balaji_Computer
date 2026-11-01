const attendanceModel = require("../models/attendanceModel");
const batchModel = require("../models/batchModel");
const userModel = require("../models/userModel");
const auditLogModel = require("../models/auditLogModel");

// Get attendance for a specific batch and date (or fetch student roster if not marked yet)
const getBatchAttendance = async (req, res) => {
    try {
        const { batchId, date } = req.query;

        if (!batchId || !date) {
            return res.status(400).json({ success: false, msg: "batchId and date are required" });
        }

        const batch = await batchModel.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, msg: "Batch not found" });
        }

        // Check if attendance is already recorded for this batch and date
        let existing = await attendanceModel.findOne({ batchId, date });

        if (existing) {
            return res.status(200).json({
                success: true,
                isMarked: true,
                attendance: existing,
            });
        }

        // If not marked, fetch students in this batch for the attendance roster
        const students = await userModel
            .find({
                role: "student",
                isActive: true,
                $or: [{ batchId: batch._id }, { batchName: batch.name }],
            })
            .select("studentId fullName mobile");

        const records = students.map((s) => ({
            studentId: s._id,
            studentName: s.fullName,
            studentCode: s.studentId || "",
            status: "present", // default to present
            remarks: "",
        }));

        return res.status(200).json({
            success: true,
            isMarked: false,
            attendance: {
                batchId: batch._id,
                batchName: batch.name,
                courseName: batch.courseName,
                date,
                totalStudents: records.length,
                presentCount: records.length,
                absentCount: 0,
                lateCount: 0,
                records,
            },
        });
    } catch (error) {
        console.error("Error in getBatchAttendance:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch attendance" });
    }
};

// Save or Update Attendance (handles duplicate prevention gracefully)
const saveAttendance = async (req, res) => {
    try {
        const { batchId, date, records, remarks } = req.body;

        if (!batchId || !date || !Array.isArray(records)) {
            return res.status(400).json({ success: false, msg: "batchId, date, and student records are required" });
        }

        const batch = await batchModel.findById(batchId);
        if (!batch) {
            return res.status(404).json({ success: false, msg: "Batch not found" });
        }

        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        records.forEach((r) => {
            if (r.status === "present") presentCount++;
            else if (r.status === "absent") absentCount++;
            else if (r.status === "late") lateCount++;
        });

        // Use findOneAndUpdate with upsert to prevent race conditions & duplicate entries
        const attendance = await attendanceModel.findOneAndUpdate(
            { batchId, date },
            {
                batchId,
                batchName: batch.name,
                courseName: batch.courseName,
                date,
                markedBy: req.user?._id,
                markedByName: req.user?.fullName || "Admin",
                totalStudents: records.length,
                presentCount,
                absentCount,
                lateCount,
                records,
            },
            { upsert: true, new: true, runValidators: true }
        );

        await auditLogModel.create({
            action: "MARK_ATTENDANCE",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Attendance",
            targetId: String(attendance._id),
            details: `Recorded attendance for batch ${batch.name} on ${date} (Present: ${presentCount}, Absent: ${absentCount}, Late: ${lateCount})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Attendance for ${batch.name} on ${date} saved successfully.`,
            attendance,
        });
    } catch (error) {
        console.error("Error in saveAttendance:", error);
        return res.status(500).json({ success: false, msg: error.message || "Failed to save attendance" });
    }
};

// Attendance Reports & Summaries
const getAttendanceReport = async (req, res) => {
    try {
        const { batchId, month, year } = req.query;
        const currentYear = year || new Date().getFullYear();
        const query = {};

        if (batchId && batchId !== "all") {
            query.batchId = batchId;
        }

        if (month && month !== "all") {
            const formattedMonth = String(month).padStart(2, "0");
            query.date = new RegExp(`^${currentYear}-${formattedMonth}`);
        }

        const records = await attendanceModel.find(query).sort({ date: -1 });

        let totalSessions = records.length;
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;

        records.forEach((r) => {
            totalPresent += r.presentCount || 0;
            totalAbsent += r.absentCount || 0;
            totalLate += r.lateCount || 0;
        });

        const overallStudentsMarked = totalPresent + totalAbsent + totalLate;
        const averageAttendanceRate =
            overallStudentsMarked > 0 ? ((totalPresent / overallStudentsMarked) * 100).toFixed(1) : 95.0;

        return res.status(200).json({
            success: true,
            summary: {
                totalSessions,
                totalPresent,
                totalAbsent,
                totalLate,
                averageRate: `${averageAttendanceRate}%`,
            },
            history: records,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to generate attendance report" });
    }
};

module.exports = {
    getBatchAttendance,
    saveAttendance,
    getAttendanceReport,
};

