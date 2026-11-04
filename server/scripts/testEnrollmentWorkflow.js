const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = require("../app");
const { connectDB, disconnectDB } = require("../config/db");

// Models
const userModel = require("../models/userModel");
const courseModel = require("../models/courseModel");
const batchModel = require("../models/batchModel");
const enrollmentRequestModel = require("../models/enrollmentRequestModel");
const courseAssignmentModel = require("../models/courseAssignmentModel");
const notificationModel = require("../models/notificationModel");
const attendanceModel = require("../models/attendanceModel");

const JWT_SECRET = process.env.JWT_SECRET;

async function runTestSuite() {
    console.log("================================================================================");
    console.log("  BALAJI COMPUTER: COMPLETE 15-STEP ENROLLMENT & COURSE MANAGEMENT TEST SUITE");
    console.log("================================================================================");

    let serverInstance = null;
    let baseUrl = "";

    try {
        await connectDB();
        console.log("✓ Connected to MongoDB database.");

        // Start temporary HTTP test server
        serverInstance = await new Promise((resolve) => {
            const s = app.listen(0, "127.0.0.1", () => resolve(s));
        });
        const port = serverInstance.address().port;
        baseUrl = `http://127.0.0.1:${port}/api`;
        console.log(`✓ Test API server listening on ${baseUrl}\n`);

        // Helper to perform HTTP requests
        const req = async (endpoint, method = "GET", body = null, token = null) => {
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const res = await fetch(`${baseUrl}${endpoint}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const text = await res.text();
            let data = null;
            try {
                data = JSON.parse(text);
            } catch {
                data = { rawText: text };
            }

            return { status: res.status, ok: res.ok, data };
        };

        const createAuthToken = (user) => {
            return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
        };

        // Seed / Prepare Test Data
        const testRunId = Date.now().toString().slice(-6);

        // 1. Create or fetch Admin
        let adminUser = await userModel.findOne({ role: "admin" });
        if (!adminUser) {
            const hash = await bcrypt.hash("AdminTest@123", 10);
            adminUser = await userModel.create({
                username: `admin_${testRunId}`,
                fullName: "Chief Administrator",
                email: `admin_${testRunId}@balajicomputer.edu`,
                password: hash,
                role: "admin",
                isActive: true,
            });
        }
        const adminToken = createAuthToken(adminUser);

        // 2. Create Student A
        const studentAHash = await bcrypt.hash("StudentA@123", 10);
        const studentA = await userModel.create({
            username: `student_a_${testRunId}`,
            fullName: "Aarav Sharma",
            email: `aarav_${testRunId}@test.edu`,
            mobile: "+91 98765 00001",
            studentId: `BC-STU-${testRunId}-A`,
            password: studentAHash,
            role: "student",
            isActive: true,
            enrollmentStatus: "NONE",
        });
        const studentAToken = createAuthToken(studentA);

        // 3. Create Student B
        const studentBHash = await bcrypt.hash("StudentB@123", 10);
        const studentB = await userModel.create({
            username: `student_b_${testRunId}`,
            fullName: "Bhavna Patel",
            email: `bhavna_${testRunId}@test.edu`,
            mobile: "+91 98765 00002",
            studentId: `BC-STU-${testRunId}-B`,
            password: studentBHash,
            role: "student",
            isActive: true,
            enrollmentStatus: "NONE",
        });
        const studentBToken = createAuthToken(studentB);

        // 4. Create Test Course
        const testCourse = await courseModel.create({
            title: `Advanced Web Development & FullStack MERN ${testRunId}`,
            code: `MERN-${testRunId}`,
            shortDescription: "Complete fullstack engineering from UI to database.",
            description: "Industry-aligned diploma course with live project certification.",
            duration: "6 Months",
            fee: 15000,
            discountFee: 12000,
            level: "Intermediate",
            category: "Programming",
            isActive: true,
            syllabus: [
                "HTML5, CSS3, Modern Responsive Layouts",
                "JavaScript ES6+, DOM, Asynchronous Programming",
                "React.js & State Architecture",
                "Node.js, Express & MongoDB Database Integration",
            ],
        });

        // 5. Create Test Batch
        const testBatch = await batchModel.create({
            name: `Morning Alpha MERN Batch ${testRunId}`,
            courseId: testCourse._id,
            courseName: testCourse.title,
            timing: "09:00 AM - 11:00 AM",
            facultyName: "Er. Dharmendra Pratap Singh",
            classroom: "Lab 2 - Advanced Software Center",
            status: "active",
        });

        console.log(`✓ Test fixture prepared: Student A (${studentA.email}), Student B (${studentB.email}), Course (${testCourse.code}), Batch (${testBatch.name})\n`);

        let passedCount = 0;
        const totalTests = 15;

        // -------------------------------------------------------------
        // TEST 1: Student submits an enrollment request
        // -------------------------------------------------------------
        console.log("[Test 1/15] Student submits an enrollment request...");
        const res1 = await req("/enrollments/request", "POST", {
            courseId: testCourse._id,
            notes: "Prefer front-row workstation in Lab 2.",
        }, studentAToken);

        if (res1.status === 201 && res1.data.success && res1.data.request?.status === "PENDING") {
            console.log("  ✓ PASS: Request created with status PENDING. Msg:", res1.data.msg);
            passedCount++;
        } else {
            throw new Error(`Test 1 Failed: ${JSON.stringify(res1)}`);
        }
        const studentARequestId = res1.data.request._id;

        // -------------------------------------------------------------
        // TEST 2: Duplicate pending request is prevented
        // -------------------------------------------------------------
        console.log("\n[Test 2/15] Duplicate pending request prevention check...");
        const res2 = await req("/enrollments/request", "POST", {
            courseId: testCourse._id,
        }, studentAToken);

        if (res2.status === 400 && !res2.data.success && res2.data.msg.includes("already have a pending enrollment request")) {
            console.log("  ✓ PASS: Duplicate pending enrollment request rejected with 400.");
            passedCount++;
        } else {
            throw new Error(`Test 2 Failed: ${JSON.stringify(res2)}`);
        }

        // -------------------------------------------------------------
        // TEST 3: Admin receives real-time notification
        // -------------------------------------------------------------
        console.log("\n[Test 3/15] Admin receives notification of student enrollment request...");
        const res3 = await req("/notifications/admin", "GET", null, adminToken);

        const foundNotif = res3.data.notifications?.find(
            (n) => n.metadata?.enrollmentRequestId === String(studentARequestId)
        );

        if (res3.status === 200 && foundNotif && foundNotif.type === "ENROLLMENT_REQUEST") {
            console.log(`  ✓ PASS: Admin received notification: "${foundNotif.title}" - ${foundNotif.message}`);
            passedCount++;
        } else {
            throw new Error(`Test 3 Failed: ${JSON.stringify(res3.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 4: Admin views pending enrollment request list
        // -------------------------------------------------------------
        console.log("\n[Test 4/15] Admin views pending requests list...");
        const res4 = await req("/admin/enrollments?status=PENDING", "GET", null, adminToken);

        const foundInAdminList = res4.data.requests?.find((r) => r._id === String(studentARequestId));

        if (res4.status === 200 && foundInAdminList) {
            console.log(`  ✓ PASS: Request found in admin pending list for student: ${foundInAdminList.studentName}`);
            passedCount++;
        } else {
            throw new Error(`Test 4 Failed: ${JSON.stringify(res4.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 5: Admin approves the request and configures course assignment
        // -------------------------------------------------------------
        console.log("\n[Test 5/15] Admin approves request and assigns batch, timing, and instructor...");
        const approvePayload = {
            batchId: testBatch._id,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            timing: "09:00 AM - 11:00 AM",
            classDays: "Monday - Saturday",
            instructorName: "Er. Dharmendra Pratap Singh",
            duration: "6 Months",
        };

        const res5 = await req(`/admin/enrollments/${studentARequestId}/approve`, "PATCH", approvePayload, adminToken);

        if (res5.status === 200 && res5.data.success && res5.data.assignment?.status === "ACTIVE") {
            console.log("  ✓ PASS: Enrollment approved, CourseAssignment created in ACTIVE status.");
            console.log(`    Assigned Batch: ${res5.data.assignment.batchName}, Timing: ${res5.data.assignment.timing}`);
            passedCount++;
        } else {
            throw new Error(`Test 5 Failed: ${JSON.stringify(res5)}`);
        }
        const assignmentId = res5.data.assignment._id;

        // -------------------------------------------------------------
        // TEST 6: Student receives approval notification
        // -------------------------------------------------------------
        console.log("\n[Test 6/15] Student checks notifications for approval confirmation...");
        const res6 = await req("/student/notifications", "GET", null, studentAToken);

        const approvalNotif = res6.data.notifications?.find((n) => n.type === "ENROLLMENT_APPROVED");

        if (res6.status === 200 && approvalNotif && approvalNotif.message.includes("approved")) {
            console.log(`  ✓ PASS: Student received notification: "${approvalNotif.message}"`);
            passedCount++;
        } else {
            throw new Error(`Test 6 Failed: ${JSON.stringify(res6.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 7: Student accesses dynamic dashboard with assigned data
        // -------------------------------------------------------------
        console.log("\n[Test 7/15] Student fetches assigned course dashboard...");
        const res7 = await req("/student/dashboard", "GET", null, studentAToken);

        if (
            res7.status === 200 &&
            res7.data.hasApprovedCourse === true &&
            res7.data.activeCourse?.title === testCourse.title &&
            res7.data.schedule?.batchName === testBatch.name
        ) {
            console.log("  ✓ PASS: Dashboard dynamic payload loaded with approved course and schedule:");
            console.log(`    • Course:   ${res7.data.activeCourse.title}`);
            console.log(`    • Batch:    ${res7.data.schedule.batchName}`);
            console.log(`    • Schedule: ${res7.data.schedule.timing} (${res7.data.schedule.classDays})`);
            console.log(`    • Mentor:   ${res7.data.schedule.instructorName}`);
            passedCount++;
        } else {
            throw new Error(`Test 7 Failed: ${JSON.stringify(res7.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 8: Student views attendance (initial 0 sessions)
        // -------------------------------------------------------------
        console.log("\n[Test 8/15] Student views read-only attendance records...");
        const res8 = await req("/student/attendance", "GET", null, studentAToken);

        if (res8.status === 200 && res8.data.success && res8.data.totalClasses === 0) {
            console.log("  ✓ PASS: Attendance accessible and correctly reports 0 initial classes.");
            passedCount++;
        } else {
            throw new Error(`Test 8 Failed: ${JSON.stringify(res8.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 9: Admin marks attendance for the batch
        // -------------------------------------------------------------
        console.log("\n[Test 9/15] Admin marks attendance session for the batch...");
        const todayStr = new Date().toISOString().slice(0, 10);
        const markPayload = {
            batchId: testBatch._id,
            date: todayStr,
            records: [
                {
                    studentId: studentA._id,
                    studentName: studentA.fullName,
                    studentCode: studentA.studentId,
                    status: "present",
                    remarks: "Completed Lab Exercise 1",
                },
            ],
        };

        const res9 = await req("/attendance/save", "POST", markPayload, adminToken);

        if (res9.status === 200 && res9.data.success && res9.data.attendance?.presentCount === 1) {
            console.log("  ✓ PASS: Attendance marked by admin. Student A recorded as Present.");
            passedCount++;
        } else {
            throw new Error(`Test 9 Failed: ${JSON.stringify(res9)}`);
        }

        // -------------------------------------------------------------
        // TEST 10: Student sees updated attendance percentage & history
        // -------------------------------------------------------------
        console.log("\n[Test 10/15] Student sees updated attendance statistics...");
        const res10 = await req("/student/dashboard", "GET", null, studentAToken);

        if (
            res10.status === 200 &&
            res10.data.attendance?.totalClasses === 1 &&
            res10.data.attendance?.classesAttended === 1 &&
            res10.data.attendance?.attendancePercentage === 100
        ) {
            console.log(`  ✓ PASS: Student attendance updated: 1/1 classes (100.0%)`);
            console.log(`    Recent history: ${JSON.stringify(res10.data.attendance.history[0])}`);
            passedCount++;
        } else {
            throw new Error(`Test 10 Failed: ${JSON.stringify(res10.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 11: Admin updates course schedule (timing & batch)
        // -------------------------------------------------------------
        console.log("\n[Test 11/15] Admin modifies course timing and class schedule...");
        const updatePayload = {
            timing: "11:00 AM - 01:00 PM",
            classDays: "Monday - Friday",
        };

        const res11 = await req(`/admin/course-assignments/assignments/${assignmentId}`, "PATCH", updatePayload, adminToken);

        if (res11.status === 200 && res11.data.assignment?.timing === "11:00 AM - 01:00 PM") {
            console.log("  ✓ PASS: Course assignment timing updated to 11:00 AM - 01:00 PM.");
            passedCount++;
        } else {
            throw new Error(`Test 11 Failed: ${JSON.stringify(res11)}`);
        }

        // -------------------------------------------------------------
        // TEST 12: Student sees updated schedule & schedule alert
        // -------------------------------------------------------------
        console.log("\n[Test 12/15] Student sees updated schedule & schedule notification...");
        const [dashRes12, notifRes12] = await Promise.all([
            req("/student/dashboard", "GET", null, studentAToken),
            req("/student/notifications", "GET", null, studentAToken),
        ]);

        const scheduleNotif = notifRes12.data.notifications?.find((n) => n.type === "SCHEDULE_UPDATED");

        if (dashRes12.data.schedule?.timing === "11:00 AM - 01:00 PM" && scheduleNotif) {
            console.log(`  ✓ PASS: Schedule updated dynamically on student dashboard: "${dashRes12.data.schedule.timing}"`);
            console.log(`    Notification received: "${scheduleNotif.message}"`);
            passedCount++;
        } else {
            throw new Error(`Test 12 Failed: ${JSON.stringify(dashRes12.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 13: Student B submits request and Admin rejects with mandatory reason
        // -------------------------------------------------------------
        console.log("\n[Test 13/15] Student B submits request and Admin rejects with reason...");
        // Student B requests enrollment
        const reqB = await req("/enrollments/request", "POST", { courseId: testCourse._id }, studentBToken);
        const reqBId = reqB.data.request._id;

        // Try rejection without reason (must fail)
        const failReject = await req(`/admin/enrollments/${reqBId}/reject`, "PATCH", { rejectionReason: "" }, adminToken);
        if (failReject.status !== 400) {
            throw new Error("Expected rejection without reason to fail with 400.");
        }

        // Reject with valid mandatory reason
        const rejectReason = "Classroom workstation capacity reached for the current quarter.";
        const res13 = await req(`/admin/enrollments/${reqBId}/reject`, "PATCH", {
            rejectionReason: rejectReason,
        }, adminToken);

        if (res13.status === 200 && res13.data.enrollment?.status === "REJECTED") {
            console.log("  ✓ PASS: Rejection without reason blocked (400). Valid rejection saved with reason.");
            passedCount++;
        } else {
            throw new Error(`Test 13 Failed: ${JSON.stringify(res13)}`);
        }

        // -------------------------------------------------------------
        // TEST 14: Rejected student cannot access protected course content
        // -------------------------------------------------------------
        console.log("\n[Test 14/15] Rejected student checks dashboard (no protected access)...");
        const res14 = await req("/student/dashboard", "GET", null, studentBToken);

        if (
            res14.status === 200 &&
            res14.data.hasApprovedCourse === false &&
            res14.data.latestRequest?.status === "REJECTED" &&
            res14.data.latestRequest?.rejectionReason === rejectReason &&
            !res14.data.activeCourse
        ) {
            console.log("  ✓ PASS: Rejected student correctly sees rejection reason and NO course access.");
            passedCount++;
        } else {
            throw new Error(`Test 14 Failed: ${JSON.stringify(res14.data)}`);
        }

        // -------------------------------------------------------------
        // TEST 15: Security Authorization & IDOR protection
        // -------------------------------------------------------------
        console.log("\n[Test 15/15] Security authorization & IDOR tests...");

        // 1. Student cannot access admin enrollments
        const sec1 = await req("/admin/enrollments", "GET", null, studentAToken);
        if (sec1.status !== 403) throw new Error("Expected 403 on admin enrollments by student");

        // 2. Student cannot approve enrollments
        const sec2 = await req(`/admin/enrollments/${studentARequestId}/approve`, "PATCH", approvePayload, studentAToken);
        if (sec2.status !== 403) throw new Error("Expected 403 on approve enrollment by student");

        // 3. Student cannot mark attendance
        const sec3 = await req("/attendance/save", "POST", markPayload, studentAToken);
        if (sec3.status !== 403) throw new Error("Expected 403 on mark attendance by student");

        // 4. Student cannot create direct course assignments
        const sec4 = await req("/admin/course-assignments/assignments", "POST", approvePayload, studentAToken);
        if (sec4.status !== 403) throw new Error("Expected 403 on direct assignment by student");

        console.log("  ✓ PASS: All student bypass attempts correctly rejected with 403 Forbidden.");
        passedCount++;

        // Clean up test fixtures created during the test run
        await Promise.all([
            enrollmentRequestModel.deleteMany({ _id: { $in: [studentARequestId, reqBId] } }),
            courseAssignmentModel.deleteMany({ studentId: { $in: [studentA._id, studentB._id] } }),
            notificationModel.deleteMany({
                $or: [
                    { recipientId: { $in: [studentA._id, studentB._id] } },
                    { "metadata.studentId": { $in: [studentA._id, studentB._id] } },
                ],
            }),
            attendanceModel.deleteMany({ batchId: testBatch._id }),
            batchModel.deleteOne({ _id: testBatch._id }),
            courseModel.deleteOne({ _id: testCourse._id }),
            userModel.deleteMany({ _id: { $in: [studentA._id, studentB._id] } }),
        ]);

        console.log("\n================================================================================");
        console.log(`  ALL ${passedCount}/${totalTests} TESTS PASSED SUCCESSFULLY! (100% PASS RATE)`);
        console.log("================================================================================");
    } catch (err) {
        console.error("\n❌ TEST FAILED:", err);
        process.exitCode = 1;
    } finally {
        if (serverInstance) {
            serverInstance.close();
        }
        await disconnectDB();
        process.exit(process.exitCode || 0);
    }
}

runTestSuite();
