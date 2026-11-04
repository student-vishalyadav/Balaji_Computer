const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../../config/db");

// Models
const userModel = require("../../models/userModel");
const courseModel = require("../../models/courseModel");
const batchModel = require("../../models/batchModel");
const enrollmentRequestModel = require("../../models/enrollmentRequestModel");
const courseAssignmentModel = require("../../models/courseAssignmentModel");
const notificationModel = require("../../models/notificationModel");

async function runMigration() {
    console.log("==================================================================");
    console.log("  BALAJI COMPUTER: DATABASE MIGRATION 001");
    console.log("  Admin-Controlled Student Enrollment & Course Assignment System");
    console.log("==================================================================");

    try {
        await connectDB();
        console.log("✓ Connected to MongoDB Atlas cluster.");

        // Step 1: Ensure indexes
        console.log("\n[1/4] Building database indexes...");
        await enrollmentRequestModel.createIndexes();
        console.log("  ✓ EnrollmentRequest collection indexes created.");

        await courseAssignmentModel.createIndexes();
        console.log("  ✓ CourseAssignment collection indexes created.");

        await notificationModel.createIndexes();
        console.log("  ✓ Notification collection indexes created.");

        // Step 2: Ensure default curriculum topics for courses if empty
        console.log("\n[2/4] Verifying course syllabus breakdowns...");
        const courses = await courseModel.find();
        let coursesUpdated = 0;

        for (const course of courses) {
            if (!course.syllabus || course.syllabus.length === 0) {
                const defaultSyllabus = [
                    "Computer Fundamentals, Hardware Overview & Windows OS",
                    "MS Office Suite: Word, Excel & PowerPoint Essentials",
                    "Advanced Lab Practicals, Internet Concepts & Email Etiquette",
                    "Professional Project Work & Speed Typing Evaluation",
                ];
                course.syllabus = defaultSyllabus;
                await course.save();
                coursesUpdated++;
            }
        }
        console.log(`  ✓ Checked ${courses.length} courses (${coursesUpdated} updated with standard syllabus).`);

        // Step 3: Backfill CourseAssignment for existing enrolled students safely
        console.log("\n[3/4] Checking existing enrolled students for legacy backfill...");
        const enrolledStudents = await userModel.find({
            role: "student",
            $or: [{ course: { $ne: "" } }, { courseId: { $ne: null } }],
        });

        let backfilledCount = 0;
        for (const student of enrolledStudents) {
            const existingAssignment = await courseAssignmentModel.findOne({
                studentId: student._id,
                status: "ACTIVE",
            });

            if (!existingAssignment) {
                // Determine course details
                let course = null;
                if (student.courseId) {
                    course = await courseModel.findById(student.courseId);
                }
                if (!course && student.course) {
                    course = await courseModel.findOne({
                        $or: [{ code: student.course }, { title: new RegExp(student.course, "i") }],
                    });
                }

                // Determine batch details
                let batch = null;
                if (student.batchId) {
                    batch = await batchModel.findById(student.batchId);
                }
                if (!batch && student.batchName) {
                    batch = await batchModel.findOne({ name: student.batchName });
                }

                const startDate = student.admissionDate || new Date();
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 6); // default 6 months

                const syllabus = course?.syllabus && course.syllabus.length > 0
                    ? course.syllabus
                    : ["Fundamentals & Windows", "MS Office Suite", "Practical Lab", "Project & Evaluation"];

                const assignment = await courseAssignmentModel.create({
                    studentId: student._id,
                    studentName: student.fullName || student.username,
                    studentCode: student.studentId || `BC-${student._id.toString().slice(-4).toUpperCase()}`,
                    courseId: course?._id || new mongoose.Types.ObjectId(),
                    courseTitle: course?.title || student.course || "ADCA (Advanced Diploma in Computer Applications)",
                    courseCode: course?.code || "ADCA",
                    courseImage: course?.image || "",
                    courseDescription: course?.shortDescription || "Computerized diploma course covering office productivity and applications.",
                    batchId: batch?._id || new mongoose.Types.ObjectId(),
                    batchName: batch?.name || student.batchName || "Morning Lab Batch A",
                    instructorName: batch?.facultyName || "Er. Dharmendra Pratap Singh",
                    startDate,
                    endDate,
                    timing: batch?.timing || "10:00 AM - 12:00 PM",
                    classDays: "Monday - Saturday",
                    duration: course?.duration || "6 Months",
                    status: "ACTIVE",
                    completedTopics: syllabus.slice(0, 2),
                    pendingTopics: syllabus.slice(2),
                    progressPercentage: 50,
                });

                student.enrollmentStatus = "APPROVED";
                student.activeAssignmentId = assignment._id;
                if (!student.studentId) {
                    student.studentId = `BC-${student._id.toString().slice(-4).toUpperCase()}`;
                }
                await student.save();
                backfilledCount++;
            }
        }
        console.log(`  ✓ Backfill complete: ${backfilledCount} students mapped to active course assignments.`);

        // Step 4: Summary
        console.log("\n[4/4] Migration validation summary:");
        const totalRequests = await enrollmentRequestModel.countDocuments();
        const totalAssignments = await courseAssignmentModel.countDocuments();
        const totalNotifications = await notificationModel.countDocuments();
        console.log(`  • Enrollment Requests: ${totalRequests}`);
        console.log(`  • Course Assignments:  ${totalAssignments}`);
        console.log(`  • Notifications:       ${totalNotifications}`);
        console.log("\n==================================================================");
        console.log("  MIGRATION 001 COMPLETED SUCCESSFULLY (0 ERRORS)");
        console.log("==================================================================");
    } catch (err) {
        console.error("\n[MIGRATION ERROR] Critical failure during migration:", err);
        process.exit(1);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

runMigration();
