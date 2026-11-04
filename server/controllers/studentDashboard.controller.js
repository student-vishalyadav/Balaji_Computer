const mongoose = require("mongoose");
const courseAssignmentModel = require("../models/courseAssignmentModel");
const enrollmentRequestModel = require("../models/enrollmentRequestModel");
const attendanceModel = require("../models/attendanceModel");
const materialModel = require("../models/materialModel");
const userModel = require("../models/userModel");
const batchModel = require("../models/batchModel");

/**
 * Fetch dynamic student dashboard based on admin-approved enrollment data
 * GET /api/student/dashboard
 */
const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Fetch fresh student profile
        const student = await userModel.findById(studentId).select("-password");
        if (!student) {
            return res.status(404).json({ success: false, msg: "Student profile not found." });
        }

        const studentProfile = {
            id: student._id,
            studentId: student.studentId || `BC-${student._id.toString().slice(-4).toUpperCase()}`,
            fullName: student.fullName || student.username,
            email: student.email,
            mobile: student.mobile || "",
            avatar: student.avatar || "",
            dob: student.dob || "",
            address: student.address || "",
            city: student.city || "",
            admissionDate: student.admissionDate || student.createdAt,
            role: student.role,
        };

        // Fetch student's active course assignment
        const activeAssignment = await courseAssignmentModel.findOne({
            studentId,
            status: "ACTIVE",
        }).populate("courseId", "title code image shortDescription description duration fee level category syllabus features");

        // Fetch pending or recent enrollment requests
        const [pendingRequests, allRequests] = await Promise.all([
            enrollmentRequestModel.find({ studentId, status: "PENDING" }).sort({ createdAt: -1 }),
            enrollmentRequestModel.find({ studentId }).sort({ createdAt: -1 }).limit(5),
        ]);

        // State 1: If NO active approved course exists
        if (!activeAssignment) {
            return res.status(200).json({
                success: true,
                hasApprovedCourse: false,
                profile: studentProfile,
                pendingRequests,
                recentRequests: allRequests,
                latestRequest: allRequests.length > 0 ? allRequests[0] : null,
                msg: pendingRequests.length > 0
                    ? "Your enrollment request is pending administrator approval."
                    : "You are not currently enrolled in an active course. Please explore our course catalog to submit an enrollment request.",
            });
        }

        // State 2: Student has active approved course assignment!
        // Fetch Attendance Data for student's assigned batch
        const batchId = activeAssignment.batchId;
        const attendanceSessions = await attendanceModel.find({ batchId }).sort({ date: -1 });

        let totalClasses = 0;
        let classesAttended = 0;
        let classesAbsent = 0;
        let classesLate = 0;
        const recentHistory = [];
        const monthlyAggregation = {};

        for (const session of attendanceSessions) {
            const studentRecord = session.records.find(
                (r) => String(r.studentId) === String(studentId)
            );

            if (studentRecord) {
                totalClasses++;
                if (studentRecord.status === "present") classesAttended++;
                else if (studentRecord.status === "late") {
                    classesAttended++;
                    classesLate++;
                } else if (studentRecord.status === "absent") {
                    classesAbsent++;
                }

                if (recentHistory.length < 10) {
                    recentHistory.push({
                        date: session.date,
                        status: studentRecord.status,
                        remarks: studentRecord.remarks || "",
                        batchName: session.batchName,
                    });
                }

                // Month aggregation (YYYY-MM)
                const monthKey = session.date.slice(0, 7);
                if (!monthlyAggregation[monthKey]) {
                    monthlyAggregation[monthKey] = { total: 0, attended: 0, absent: 0 };
                }
                monthlyAggregation[monthKey].total++;
                if (studentRecord.status === "present" || studentRecord.status === "late") {
                    monthlyAggregation[monthKey].attended++;
                } else {
                    monthlyAggregation[monthKey].absent++;
                }
            }
        }

        const attendancePercentage = totalClasses > 0
            ? parseFloat(((classesAttended / totalClasses) * 100).toFixed(1))
            : 100.0;

        const monthlyReport = Object.keys(monthlyAggregation)
            .sort()
            .reverse()
            .slice(0, 6)
            .map((month) => {
                const data = monthlyAggregation[month];
                const pct = data.total > 0 ? ((data.attended / data.total) * 100).toFixed(1) : 100;
                return {
                    month,
                    totalClasses: data.total,
                    attended: data.attended,
                    absent: data.absent,
                    percentage: `${pct}%`,
                };
            });

        // Fetch Study Materials available for this course
        const materialsCount = await materialModel.countDocuments({
            $or: [
                { courseId: activeAssignment.courseId?._id || activeAssignment.courseId },
                { targetAudience: "All Students" },
            ],
        });

        // Compute Next Class information
        const batchInfo = await batchModel.findById(batchId);
        const classroom = batchInfo?.classroom || "Central Computer Lab";

        const nextClass = {
            timing: activeAssignment.timing,
            classDays: activeAssignment.classDays,
            classroom,
            instructorName: activeAssignment.instructorName,
            batchName: activeAssignment.batchName,
            topic: activeAssignment.pendingTopics?.[0] || "Hands-on Practical Lab Exercise",
        };

        // Dynamic Course Progress
        const completedTopics = activeAssignment.completedTopics || [];
        const pendingTopics = activeAssignment.pendingTopics || [];
        const totalTopics = completedTopics.length + pendingTopics.length;
        const progressPercentage = totalTopics > 0
            ? Math.round((completedTopics.length / totalTopics) * 100)
            : (activeAssignment.progressPercentage || 50);

        return res.status(200).json({
            success: true,
            hasApprovedCourse: true,
            profile: studentProfile,
            activeCourse: {
                id: activeAssignment._id,
                courseId: activeAssignment.courseId?._id || activeAssignment.courseId,
                title: activeAssignment.courseTitle,
                code: activeAssignment.courseCode,
                image: activeAssignment.courseImage || activeAssignment.courseId?.image || "",
                description: activeAssignment.courseDescription || activeAssignment.courseId?.shortDescription || "",
                startDate: activeAssignment.startDate,
                endDate: activeAssignment.endDate,
                duration: activeAssignment.duration,
                status: activeAssignment.status,
                syllabus: activeAssignment.courseId?.syllabus || [],
            },
            schedule: {
                batchId: activeAssignment.batchId,
                batchName: activeAssignment.batchName,
                timing: activeAssignment.timing,
                classDays: activeAssignment.classDays,
                instructorName: activeAssignment.instructorName,
                classroom,
                nextClass,
            },
            attendance: {
                totalClasses,
                classesAttended,
                classesAbsent,
                classesLate,
                attendancePercentage,
                history: recentHistory,
                monthlyReport,
            },
            progress: {
                progressPercentage,
                completedTopics,
                pendingTopics,
                learningMaterialsCount: materialsCount,
                assignmentsCount: Math.max(1, completedTopics.length),
            },
            pendingRequests,
        });
    } catch (error) {
        console.error("Error in getStudentDashboard:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to load student dashboard.",
        });
    }
};

/**
 * Fetch detailed read-only attendance records for student
 * GET /api/student/attendance
 */
const getStudentAttendance = async (req, res) => {
    try {
        const studentId = req.user._id;

        const activeAssignment = await courseAssignmentModel.findOne({
            studentId,
            status: "ACTIVE",
        });

        if (!activeAssignment) {
            return res.status(200).json({
                success: true,
                totalClasses: 0,
                classesAttended: 0,
                classesAbsent: 0,
                attendancePercentage: 0,
                history: [],
                monthlyReport: [],
                msg: "No active course assignment found.",
            });
        }

        const sessions = await attendanceModel.find({
            batchId: activeAssignment.batchId,
        }).sort({ date: -1 });

        let totalClasses = 0;
        let classesAttended = 0;
        let classesAbsent = 0;
        const history = [];
        const monthlyAggregation = {};

        for (const session of sessions) {
            const record = session.records.find((r) => String(r.studentId) === String(studentId));
            if (record) {
                totalClasses++;
                if (record.status === "present" || record.status === "late") {
                    classesAttended++;
                } else {
                    classesAbsent++;
                }

                history.push({
                    date: session.date,
                    status: record.status,
                    remarks: record.remarks || "",
                    batchName: session.batchName,
                    markedByName: session.markedByName || "Instructor",
                });

                const monthKey = session.date.slice(0, 7);
                if (!monthlyAggregation[monthKey]) {
                    monthlyAggregation[monthKey] = { total: 0, attended: 0, absent: 0 };
                }
                monthlyAggregation[monthKey].total++;
                if (record.status === "present" || record.status === "late") {
                    monthlyAggregation[monthKey].attended++;
                } else {
                    monthlyAggregation[monthKey].absent++;
                }
            }
        }

        const attendancePercentage = totalClasses > 0
            ? parseFloat(((classesAttended / totalClasses) * 100).toFixed(1))
            : 100.0;

        const monthlyReport = Object.keys(monthlyAggregation)
            .sort()
            .reverse()
            .map((month) => {
                const data = monthlyAggregation[month];
                const pct = data.total > 0 ? ((data.attended / data.total) * 100).toFixed(1) : 100;
                return {
                    month,
                    totalClasses: data.total,
                    attended: data.attended,
                    absent: data.absent,
                    percentage: `${pct}%`,
                };
            });

        return res.status(200).json({
            success: true,
            totalClasses,
            classesAttended,
            classesAbsent,
            attendancePercentage,
            history,
            monthlyReport,
            courseTitle: activeAssignment.courseTitle,
            batchName: activeAssignment.batchName,
        });
    } catch (error) {
        console.error("Error in getStudentAttendance:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch student attendance records.",
        });
    }
};

/**
 * Fetch list of all active approved courses for student
 * GET /api/student/active-courses
 */
const getStudentActiveCourses = async (req, res) => {
    try {
        const studentId = req.user._id;

        const assignments = await courseAssignmentModel
            .find({ studentId, status: "ACTIVE" })
            .populate("courseId", "title code fee duration level image category syllabus");

        return res.status(200).json({
            success: true,
            count: assignments.length,
            courses: assignments,
        });
    } catch (error) {
        console.error("Error in getStudentActiveCourses:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch active courses.",
        });
    }
};

module.exports = {
    getStudentDashboard,
    getStudentAttendance,
    getStudentActiveCourses,
};
