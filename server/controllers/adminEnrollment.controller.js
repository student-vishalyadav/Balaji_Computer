const mongoose = require("mongoose");
const enrollmentRequestModel = require("../models/enrollmentRequestModel");
const courseAssignmentModel = require("../models/courseAssignmentModel");
const courseModel = require("../models/courseModel");
const batchModel = require("../models/batchModel");
const userModel = require("../models/userModel");
const notificationModel = require("../models/notificationModel");
const auditLogModel = require("../models/auditLogModel");

/**
 * Get all enrollment requests with status filter, search & pagination
 * GET /api/admin/enrollments
 */
const getAllEnrollments = async (req, res) => {
    try {
        const { status = "ALL", search = "", page = 1, limit = 20 } = req.query;

        const query = {};

        if (status && status !== "ALL") {
            query.status = status.toUpperCase();
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { studentName: regex },
                { studentEmail: regex },
                { studentMobile: regex },
                { studentCode: regex },
                { courseTitle: regex },
                { courseCode: regex },
            ];
        }

        const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

        const [requests, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
            enrollmentRequestModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parsedLimit)
                .populate("studentId", "fullName email mobile studentId avatar isActive")
                .populate("courseId", "title code fee duration level image category"),
            enrollmentRequestModel.countDocuments(query),
            enrollmentRequestModel.countDocuments({ status: "PENDING" }),
            enrollmentRequestModel.countDocuments({ status: "APPROVED" }),
            enrollmentRequestModel.countDocuments({ status: "REJECTED" }),
        ]);

        return res.status(200).json({
            success: true,
            requests,
            pagination: {
                total: totalCount,
                page: parseInt(page, 10),
                limit: parsedLimit,
                pages: Math.ceil(totalCount / parsedLimit),
            },
            counts: {
                total: pendingCount + approvedCount + rejectedCount,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
            },
        });
    } catch (error) {
        console.error("Error in getAllEnrollments:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch enrollment requests.",
        });
    }
};

/**
 * Get single enrollment request details by ID
 * GET /api/admin/enrollments/:id
 */
const getEnrollmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid enrollment ID." });
        }

        const request = await enrollmentRequestModel
            .findById(id)
            .populate("studentId", "fullName email mobile studentId avatar isActive dob address city state pinCode admissionDate")
            .populate("courseId", "title code duration fee discountFee level syllabus features image description")
            .populate("courseAssignmentId");

        if (!request) {
            return res.status(404).json({ success: false, msg: "Enrollment request not found." });
        }

        return res.status(200).json({
            success: true,
            request,
        });
    } catch (error) {
        console.error("Error in getEnrollmentById:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to fetch enrollment details.",
        });
    }
};

/**
 * Approve student enrollment & configure complete course assignment
 * PATCH /api/admin/enrollments/:id/approve
 */
const approveEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            batchId,
            startDate,
            endDate,
            timing,
            classDays,
            instructorName,
            duration,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid enrollment ID." });
        }

        if (!batchId) {
            return res.status(400).json({ success: false, msg: "Assigned batch is required for enrollment approval." });
        }

        const enrollment = await enrollmentRequestModel.findById(id);
        if (!enrollment) {
            return res.status(404).json({ success: false, msg: "Enrollment request not found." });
        }

        if (enrollment.status === "APPROVED") {
            return res.status(400).json({
                success: false,
                msg: "This enrollment request has already been approved.",
            });
        }

        const [student, course, batch] = await Promise.all([
            userModel.findById(enrollment.studentId),
            courseModel.findById(enrollment.courseId),
            batchModel.findById(batchId),
        ]);

        if (!student) {
            return res.status(404).json({ success: false, msg: "Associated student account does not exist." });
        }
        if (!course) {
            return res.status(404).json({ success: false, msg: "Associated course does not exist." });
        }
        if (!batch) {
            return res.status(404).json({ success: false, msg: "Selected batch does not exist." });
        }

        const adminName = req.user.fullName || req.user.username || "Admin";
        const adminId = req.user._id;

        // Calculate start and end dates
        const assignedStartDate = startDate ? new Date(startDate) : new Date();
        let assignedEndDate;
        if (endDate) {
            assignedEndDate = new Date(endDate);
        } else {
            assignedEndDate = new Date(assignedStartDate);
            // Default 6 months or 1 year
            assignedEndDate.setMonth(assignedEndDate.getMonth() + 6);
        }

        const assignedTiming = timing ? timing.trim() : (batch.timing || "09:00 AM - 11:00 AM");
        const assignedClassDays = classDays ? classDays.trim() : "Monday - Saturday";
        const assignedInstructor = instructorName ? instructorName.trim() : (batch.facultyName || "Certified Instructor");
        const assignedDuration = duration ? duration.trim() : (course.duration || "6 Months");

        // Prepare syllabus topics for dynamic progress tracking
        const syllabus = course.syllabus && course.syllabus.length > 0
            ? course.syllabus
            : [
                  "Computer Fundamentals & Operating Systems",
                  "MS Office Productivity Suite (Word, Excel, PowerPoint)",
                  "Practical Lab Sessions & Case Studies",
                  "Final Evaluation & Speed Certification",
              ];

        // Deactivate any previous active assignment for this student and course
        await courseAssignmentModel.updateMany(
            { studentId: student._id, courseId: course._id, status: "ACTIVE" },
            { status: "CANCELLED" }
        );

        // Generate student ID if missing
        if (!student.studentId) {
            student.studentId = `BC-${student._id.toString().slice(-4).toUpperCase()}`;
        }

        // Create new CourseAssignment
        const assignment = await courseAssignmentModel.create({
            studentId: student._id,
            studentName: student.fullName || student.username,
            studentCode: student.studentId,
            courseId: course._id,
            courseTitle: course.title,
            courseCode: course.code,
            courseImage: course.image || "",
            courseDescription: course.shortDescription || course.description || "",
            batchId: batch._id,
            batchName: batch.name,
            instructorId: batch.facultyId || null,
            instructorName: assignedInstructor,
            startDate: assignedStartDate,
            endDate: assignedEndDate,
            timing: assignedTiming,
            classDays: assignedClassDays,
            duration: assignedDuration,
            status: "ACTIVE",
            enrollmentRequestId: enrollment._id,
            assignedBy: adminId,
            assignedByName: adminName,
            completedTopics: syllabus.slice(0, 1),
            pendingTopics: syllabus.slice(1),
            progressPercentage: Math.round((1 / syllabus.length) * 100),
        });

        // Update enrollment request
        enrollment.status = "APPROVED";
        enrollment.reviewedBy = adminId;
        enrollment.reviewedByName = adminName;
        enrollment.reviewedAt = new Date();
        enrollment.courseAssignmentId = assignment._id;
        enrollment.rejectionReason = "";
        await enrollment.save();

        // Update student model
        student.course = course.title;
        student.courseId = course._id;
        student.batchId = batch._id;
        student.batchName = batch.name;
        student.enrollmentStatus = "APPROVED";
        student.activeAssignmentId = assignment._id;
        await student.save();

        // Increment batch current enrollment
        await batchModel.findByIdAndUpdate(batch._id, {
            $inc: { currentEnrollment: 1 },
        });

        // Notify Student
        await notificationModel.create({
            recipientRole: "student",
            recipientId: student._id,
            type: "ENROLLMENT_APPROVED",
            title: "Enrollment Approved!",
            message: `Congratulations! Your enrollment request for ${course.title} has been approved. Your course dashboard is now available.`,
            link: "/student/dashboard",
            metadata: {
                courseId: course._id,
                courseTitle: course.title,
                batchName: batch.name,
                timing: assignedTiming,
                classDays: assignedClassDays,
            },
        });

        // Audit Log
        await auditLogModel.create({
            action: "APPROVE_ENROLLMENT",
            performedBy: adminName,
            targetType: "EnrollmentRequest",
            targetId: String(enrollment._id),
            details: `Approved enrollment for ${student.fullName || student.username} in ${course.title}. Assigned batch: ${batch.name}, timing: ${assignedTiming}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Enrollment for ${student.fullName || student.username} approved successfully. Course dashboard activated.`,
            assignment,
            enrollment,
        });
    } catch (error) {
        console.error("Error in approveEnrollment:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to approve enrollment request. Please try again.",
        });
    }
};

/**
 * Reject student enrollment request with mandatory rejection reason
 * PATCH /api/admin/enrollments/:id/reject
 */
const rejectEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid enrollment ID." });
        }

        if (!rejectionReason || rejectionReason.trim().length < 3) {
            return res.status(400).json({
                success: false,
                msg: "A mandatory rejection reason is required (minimum 3 characters).",
            });
        }

        const enrollment = await enrollmentRequestModel.findById(id);
        if (!enrollment) {
            return res.status(404).json({ success: false, msg: "Enrollment request not found." });
        }

        const adminName = req.user.fullName || req.user.username || "Admin";
        const adminId = req.user._id;

        enrollment.status = "REJECTED";
        enrollment.rejectionReason = rejectionReason.trim();
        enrollment.reviewedBy = adminId;
        enrollment.reviewedByName = adminName;
        enrollment.reviewedAt = new Date();
        await enrollment.save();

        // Update student model
        await userModel.findByIdAndUpdate(enrollment.studentId, {
            enrollmentStatus: "REJECTED",
        });

        // If there was an active assignment created by mistake, cancel it
        if (enrollment.courseAssignmentId) {
            await courseAssignmentModel.findByIdAndUpdate(enrollment.courseAssignmentId, {
                status: "CANCELLED",
            });
        }

        // Notify Student
        await notificationModel.create({
            recipientRole: "student",
            recipientId: enrollment.studentId,
            type: "ENROLLMENT_REJECTED",
            title: "Enrollment Request Update",
            message: `Your enrollment request has been rejected. Reason: ${rejectionReason.trim()}. Please contact the institute for further assistance.`,
            link: "/student/dashboard",
            metadata: {
                courseTitle: enrollment.courseTitle,
                rejectionReason: rejectionReason.trim(),
            },
        });

        // Audit Log
        await auditLogModel.create({
            action: "REJECT_ENROLLMENT",
            performedBy: adminName,
            targetType: "EnrollmentRequest",
            targetId: String(enrollment._id),
            details: `Rejected enrollment request for ${enrollment.studentName}. Reason: ${rejectionReason.trim()}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: "Enrollment request has been rejected successfully.",
            enrollment,
        });
    } catch (error) {
        console.error("Error in rejectEnrollment:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to reject enrollment request.",
        });
    }
};

/**
 * Admin creates a direct course assignment without a student request
 * POST /api/admin/course-assignments
 */
const createDirectAssignment = async (req, res) => {
    try {
        const {
            studentId,
            courseId,
            batchId,
            startDate,
            endDate,
            timing,
            classDays,
            instructorName,
            duration,
        } = req.body;

        if (!studentId || !courseId || !batchId) {
            return res.status(400).json({
                success: false,
                msg: "studentId, courseId, and batchId are required.",
            });
        }

        const [student, course, batch] = await Promise.all([
            userModel.findById(studentId),
            courseModel.findById(courseId),
            batchModel.findById(batchId),
        ]);

        if (!student || !course || !batch) {
            return res.status(404).json({
                success: false,
                msg: "Student, Course, or Batch was not found.",
            });
        }

        const adminName = req.user.fullName || req.user.username || "Admin";

        const assignedStartDate = startDate ? new Date(startDate) : new Date();
        const assignedEndDate = endDate ? new Date(endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

        if (!student.studentId) {
            student.studentId = `BC-${student._id.toString().slice(-4).toUpperCase()}`;
        }

        const syllabus = course.syllabus && course.syllabus.length > 0
            ? course.syllabus
            : ["Module 1 Fundamentals", "Module 2 Applications", "Module 3 Practical Lab", "Module 4 Certification"];

        // Deactivate existing
        await courseAssignmentModel.updateMany(
            { studentId: student._id, courseId: course._id, status: "ACTIVE" },
            { status: "CANCELLED" }
        );

        const assignment = await courseAssignmentModel.create({
            studentId: student._id,
            studentName: student.fullName || student.username,
            studentCode: student.studentId,
            courseId: course._id,
            courseTitle: course.title,
            courseCode: course.code,
            courseImage: course.image || "",
            courseDescription: course.shortDescription || course.description || "",
            batchId: batch._id,
            batchName: batch.name,
            instructorId: batch.facultyId || null,
            instructorName: instructorName || batch.facultyName || "Institute Mentor",
            startDate: assignedStartDate,
            endDate: assignedEndDate,
            timing: timing || batch.timing || "10:00 AM - 12:00 PM",
            classDays: classDays || "Monday - Saturday",
            duration: duration || course.duration || "6 Months",
            status: "ACTIVE",
            assignedBy: req.user._id,
            assignedByName: adminName,
            completedTopics: syllabus.slice(0, 1),
            pendingTopics: syllabus.slice(1),
            progressPercentage: Math.round((1 / syllabus.length) * 100),
        });

        // Update student record
        student.course = course.title;
        student.courseId = course._id;
        student.batchId = batch._id;
        student.batchName = batch.name;
        student.enrollmentStatus = "APPROVED";
        student.activeAssignmentId = assignment._id;
        await student.save();

        // Increment batch enrollment
        await batchModel.findByIdAndUpdate(batch._id, { $inc: { currentEnrollment: 1 } });

        // Notify Student
        await notificationModel.create({
            recipientRole: "student",
            recipientId: student._id,
            type: "ENROLLMENT_APPROVED",
            title: "Course Assigned by Institute",
            message: `You have been assigned to ${course.title} (Batch: ${batch.name}, Timing: ${assignment.timing}).`,
            link: "/student/dashboard",
        });

        return res.status(201).json({
            success: true,
            msg: `Course assigned to ${student.fullName || student.username} successfully.`,
            assignment,
        });
    } catch (error) {
        console.error("Error in createDirectAssignment:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to create course assignment.",
        });
    }
};

/**
 * Admin modifies an existing course assignment (timing, batch, instructor, etc.)
 * PATCH /api/admin/course-assignments/:id
 */
const updateCourseAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            batchId,
            timing,
            classDays,
            instructorName,
            startDate,
            endDate,
            duration,
            status,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, msg: "Invalid assignment ID." });
        }

        const assignment = await courseAssignmentModel.findById(id);
        if (!assignment) {
            return res.status(404).json({ success: false, msg: "Course assignment not found." });
        }

        const oldTiming = assignment.timing;
        const oldBatch = assignment.batchName;

        let batchChanged = false;
        if (batchId && batchId !== String(assignment.batchId)) {
            const newBatch = await batchModel.findById(batchId);
            if (newBatch) {
                // Decrement old batch
                await batchModel.findByIdAndUpdate(assignment.batchId, { $inc: { currentEnrollment: -1 } });
                // Increment new batch
                await batchModel.findByIdAndUpdate(newBatch._id, { $inc: { currentEnrollment: 1 } });

                assignment.batchId = newBatch._id;
                assignment.batchName = newBatch.name;
                batchChanged = true;
            }
        }

        if (timing) assignment.timing = timing.trim();
        if (classDays) assignment.classDays = classDays.trim();
        if (instructorName) assignment.instructorName = instructorName.trim();
        if (startDate) assignment.startDate = new Date(startDate);
        if (endDate) assignment.endDate = new Date(endDate);
        if (duration) assignment.duration = duration.trim();
        if (status) assignment.status = status;

        await assignment.save();

        // Update student record
        await userModel.findByIdAndUpdate(assignment.studentId, {
            batchId: assignment.batchId,
            batchName: assignment.batchName,
        });

        // If schedule or batch changed, notify student
        const timingChanged = timing && timing.trim() !== oldTiming;
        if (batchChanged || timingChanged || classDays) {
            await notificationModel.create({
                recipientRole: "student",
                recipientId: assignment.studentId,
                type: "SCHEDULE_UPDATED",
                title: "Course Schedule Updated",
                message: `Your class schedule has been updated: Batch ${assignment.batchName}, Timing ${assignment.timing}, Days: ${assignment.classDays}.`,
                link: "/student/dashboard",
                metadata: {
                    batchName: assignment.batchName,
                    timing: assignment.timing,
                    classDays: assignment.classDays,
                },
            });
        }

        // Audit Log
        await auditLogModel.create({
            action: "UPDATE_COURSE_ASSIGNMENT",
            performedBy: req.user.fullName || "Admin",
            targetType: "CourseAssignment",
            targetId: String(assignment._id),
            details: `Updated course assignment for ${assignment.studentName}. Batch: ${assignment.batchName}, Timing: ${assignment.timing}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: "Course assignment updated successfully.",
            assignment,
        });
    } catch (error) {
        console.error("Error in updateCourseAssignment:", error);
        return res.status(500).json({
            success: false,
            msg: "Failed to update course assignment.",
        });
    }
};

module.exports = {
    getAllEnrollments,
    getEnrollmentById,
    approveEnrollment,
    rejectEnrollment,
    createDirectAssignment,
    updateCourseAssignment,
};
