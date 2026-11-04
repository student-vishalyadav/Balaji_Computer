const mongoose = require("mongoose");
const enrollmentRequestModel = require("../models/enrollmentRequestModel");
const courseAssignmentModel = require("../models/courseAssignmentModel");
const courseModel = require("../models/courseModel");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");
const auditLogModel = require("../models/auditLogModel");

/**
 * Student submits an enrollment request for a specific course
 * POST /api/enrollments/request
 */
const requestEnrollment = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseId, notes = "" } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                msg: "Course ID is required to request enrollment.",
            });
        }

        // Validate course existence and active status
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                msg: "The requested course was not found in our catalog.",
            });
        }

        if (!course.isActive) {
            return res.status(400).json({
                success: false,
                msg: "This course is currently not accepting new enrollments.",
            });
        }

        // Prevent duplicate pending requests for the same course
        const existingPending = await enrollmentRequestModel.findOne({
            studentId,
            courseId: course._id,
            status: "PENDING",
        });

        if (existingPending) {
            return res.status(400).json({
                success: false,
                msg: "You already have a pending enrollment request for this course. Please wait for admin approval.",
                request: existingPending,
            });
        }

        // Check if student is already actively enrolled in this course
        const alreadyActive = await courseAssignmentModel.findOne({
            studentId,
            courseId: course._id,
            status: "ACTIVE",
        });

        if (alreadyActive) {
            return res.status(400).json({
                success: false,
                msg: "You are already actively enrolled in this course. Visit your student dashboard to access class materials.",
            });
        }

        // Create enrollment request in PENDING state
        const studentName = req.user.fullName || req.user.username;
        const studentEmail = req.user.email;
        const studentMobile = req.user.mobile || "";
        const studentCode = req.user.studentId || `BC-${studentId.toString().slice(-4).toUpperCase()}`;

        const enrollmentRequest = await enrollmentRequestModel.create({
            studentId,
            studentName,
            studentEmail,
            studentMobile,
            studentCode,
            courseId: course._id,
            courseTitle: course.title,
            courseCode: course.code,
            courseFee: course.discountFee > 0 ? course.discountFee : course.fee,
            status: "PENDING",
            notes: notes.trim(),
            requestDate: new Date(),
        });

        // Update student model enrollment status
        await userModel.findByIdAndUpdate(studentId, {
            enrollmentStatus: "PENDING",
        });

        // Send Notification to Admin Panel
        await notificationModel.create({
            recipientRole: "admin",
            type: "ENROLLMENT_REQUEST",
            title: "New Student Enrollment Request",
            message: `${studentName} has requested enrollment in ${course.title} (${course.code}).`,
            link: "/admin/enrollments?status=PENDING",
            metadata: {
                enrollmentRequestId: enrollmentRequest._id,
                studentId,
                courseId: course._id,
                studentName,
                courseTitle: course.title,
            },
        });

        // Log audit entry
        await auditLogModel.create({
            action: "ENROLLMENT_REQUEST",
            performedBy: studentName,
            targetType: "EnrollmentRequest",
            targetId: String(enrollmentRequest._id),
            details: `Submitted enrollment request for ${course.title} (${course.code})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: "Your enrollment request has been submitted successfully. Please wait for admin approval.",
            request: enrollmentRequest,
        });
    } catch (error) {
        console.error("Error in requestEnrollment:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to submit enrollment request. Please try again.",
        });
    }
};

/**
 * Get all enrollment requests for the currently logged-in student
 * GET /api/enrollments/my-requests
 */
const getMyRequests = async (req, res) => {
    try {
        const studentId = req.user._id;

        const requests = await enrollmentRequestModel
            .find({ studentId })
            .populate("courseId", "title code duration fee discountFee image category level")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests,
        });
    } catch (error) {
        console.error("Error in getMyRequests:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch your enrollment requests.",
        });
    }
};

/**
 * Check student's current enrollment status for a particular course
 * GET /api/enrollments/status/:courseId
 */
const getCourseEnrollmentStatus = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ success: false, msg: "Invalid Course ID." });
        }

        // Check active assignment
        const activeAssignment = await courseAssignmentModel.findOne({
            studentId,
            courseId,
            status: "ACTIVE",
        });

        if (activeAssignment) {
            return res.status(200).json({
                success: true,
                status: "APPROVED",
                isEnrolled: true,
                assignment: activeAssignment,
            });
        }

        // Check latest request
        const latestRequest = await enrollmentRequestModel
            .findOne({ studentId, courseId })
            .sort({ createdAt: -1 });

        if (latestRequest) {
            return res.status(200).json({
                success: true,
                status: latestRequest.status,
                isEnrolled: false,
                request: latestRequest,
            });
        }

        return res.status(200).json({
            success: true,
            status: "NONE",
            isEnrolled: false,
            request: null,
        });
    } catch (error) {
        console.error("Error in getCourseEnrollmentStatus:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to determine enrollment status.",
        });
    }
};

module.exports = {
    requestEnrollment,
    getMyRequests,
    getCourseEnrollmentStatus,
};
