const userModel = require("../models/userModel");
const feeModel = require("../models/feeModel");
const batchModel = require("../models/batchModel");
const courseModel = require("../models/courseModel");
const attendanceModel = require("../models/attendanceModel");
const examModel = require("../models/examModel");
const auditLogModel = require("../models/auditLogModel");
const bcrypt = require("bcrypt");

// Helper to generate unique Student ID
const generateStudentId = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `BC-${currentYear}-`;
    const count = await userModel.countDocuments({ role: "student" });
    const sequence = String(count + 101).padStart(4, "0");
    let candidate = `${prefix}${sequence}`;

    let exists = await userModel.findOne({ studentId: candidate });
    let counter = 1;
    while (exists) {
        candidate = `${prefix}${String(count + 101 + counter).padStart(4, "0")}`;
        exists = await userModel.findOne({ studentId: candidate });
        counter++;
    }
    return candidate;
};

// 1. Get all students with search, filters, pagination, and sorting
const getStudents = async (req, res) => {
    try {
        const {
            search,
            course,
            batch,
            feeStatus,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const query = { role: "student" };

        // Search text
        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [
                { fullName: regex },
                { username: regex },
                { email: regex },
                { mobile: regex },
                { studentId: regex },
            ];
        }

        // Filters
        if (course && course !== "all") {
            query.course = course;
        }

        if (batch && batch !== "all") {
            query.batchName = batch;
        }

        if (feeStatus && feeStatus !== "all") {
            query.feeStatus = feeStatus;
        }

        if (status && status !== "all") {
            query.isActive = status === "active";
        }

        if (startDate || endDate) {
            query.admissionDate = {};
            if (startDate) query.admissionDate.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.admissionDate.$lte = end;
            }
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.max(1, parseInt(limit));
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        const sortOptions = {};
        if (sortBy === "name") {
            sortOptions.fullName = order === "asc" ? 1 : -1;
        } else if (sortBy === "studentId") {
            sortOptions.studentId = order === "asc" ? 1 : -1;
        } else {
            sortOptions[sortBy] = order === "asc" ? 1 : -1;
        }

        const total = await userModel.countDocuments(query);
        const students = await userModel
            .find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .select("-password");

        return res.status(200).json({
            success: true,
            students,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum) || 1,
                limit: limitNum,
            },
        });
    } catch (error) {
        console.error("Error in getStudents:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch students" });
    }
};

// 2. Add New Student with secure fee calculations
const addStudent = async (req, res) => {
    try {
        const {
            fullName,
            email,
            mobile,
            password,
            dob,
            gender,
            address,
            city,
            state,
            pinCode,
            parentName,
            parentPhone,
            course,
            batchId,
            batchName,
            admissionDate,
            totalCourseFee,
            discount = 0,
            initialPayment = 0,
            paymentMethod = "cash",
            transactionRef = "",
            isActive = true,
        } = req.body;

        if (!fullName || !email || !mobile || !course) {
            return res.status(400).json({
                success: false,
                msg: "Full Name, Email, Mobile Number, and Course are required fields.",
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await userModel.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: "A student account with this email address already exists.",
            });
        }

        // Generate student ID
        const studentId = await generateStudentId();

        // Safe backend fee calculations
        const parsedTotalFee = Math.max(0, parseFloat(totalCourseFee) || 0);
        const parsedDiscount = Math.max(0, parseFloat(discount) || 0);
        const netFee = Math.max(0, parsedTotalFee - parsedDiscount);
        const parsedInitialPayment = Math.max(0, parseFloat(initialPayment) || 0);
        const remainingBalance = Math.max(0, netFee - parsedInitialPayment);

        let feeStatus = "pending";
        if (parsedInitialPayment >= netFee && netFee > 0) {
            feeStatus = "paid";
        } else if (parsedInitialPayment > 0) {
            feeStatus = "partial";
        }

        // Password hash (default to mobile if password omitted)
        const rawPassword = password || mobile.replace(/\D/g, "").slice(-6) || "Student@123";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newStudent = await userModel.create({
            username: studentId,
            fullName: fullName.trim(),
            email: cleanEmail,
            mobile: mobile.trim(),
            password: hashedPassword,
            studentId,
            dob: dob || "",
            gender: gender || "",
            address: address || "",
            city: city || "",
            state: state || "",
            pinCode: pinCode || "",
            parentName: parentName || "",
            parentPhone: parentPhone || "",
            course: course.trim(),
            batchId: batchId || null,
            batchName: batchName || "Unassigned",
            admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
            totalFee: parsedTotalFee,
            discount: parsedDiscount,
            netFee,
            paidAmount: parsedInitialPayment,
            remainingBalance,
            feeStatus,
            isActive: isActive !== false,
            role: "student",
        });

        // Initialize Fee Ledger
        const receiptNumber = `BC-RCP-${Date.now().toString().slice(-6)}`;
        const initialPaymentsList = [];
        if (parsedInitialPayment > 0) {
            initialPaymentsList.push({
                receiptNumber,
                amount: parsedInitialPayment,
                paymentDate: new Date(),
                paymentMethod,
                transactionRef: transactionRef.trim(),
                receivedBy: req.user?.fullName || "Admin",
                remarks: "Initial admission fee payment",
            });
        }

        await feeModel.create({
            studentId: newStudent._id,
            studentName: newStudent.fullName,
            studentCode: studentId,
            courseName: course.trim(),
            totalFee: parsedTotalFee,
            discount: parsedDiscount,
            netFee,
            paidAmount: parsedInitialPayment,
            remainingBalance,
            status: feeStatus,
            payments: initialPaymentsList,
        });

        // Update batch enrollment counter if batchId is valid
        if (batchId && mongoose.Types.ObjectId.isValid(batchId)) {
            await batchModel.findByIdAndUpdate(batchId, { $inc: { currentEnrollment: 1 } });
        }

        // Audit log
        await auditLogModel.create({
            action: "ADD_STUDENT",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(newStudent._id),
            details: `Enrolled student ${newStudent.fullName} (${studentId}) in ${course}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Student ${fullName} admitted successfully with Student ID: ${studentId}`,
            student: newStudent,
        });
    } catch (error) {
        console.error("Error in addStudent:", error);
        return res.status(500).json({
            success: false,
            msg: error.message || "Failed to admit student",
        });
    }
};

// 3. Get Student Profile & All Tab Details
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        let student = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            student = await userModel.findById(id).select("-password");
        }
        if (!student) {
            student = await userModel.findOne({ studentId: id.toUpperCase() }).select("-password");
        }

        if (!student) {
            return res.status(404).json({ success: false, msg: "Student record not found" });
        }

        // Fetch student's fee record
        const feeRecord = await feeModel.findOne({ studentId: student._id });

        // Fetch attendance stats for this student
        const attendanceRecords = await attendanceModel
            .find({ "records.studentId": student._id })
            .select("batchName date records.$");

        let totalClasses = attendanceRecords.length;
        let presentCount = 0;
        let absentCount = 0;
        let lateCount = 0;

        attendanceRecords.forEach((a) => {
            const rec = a.records[0];
            if (rec?.status === "present") presentCount++;
            else if (rec?.status === "absent") absentCount++;
            else if (rec?.status === "late") lateCount++;
        });

        const attendanceRate = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 100;

        // Fetch exam results
        const exams = await examModel
            .find({ "results.studentId": student._id })
            .select("title courseName scheduledDate results.$");

        const examResults = exams.map((e) => ({
            examTitle: e.title,
            courseName: e.courseName,
            date: e.scheduledDate,
            result: e.results[0],
        }));

        return res.status(200).json({
            success: true,
            student,
            fees: feeRecord || {
                totalFee: student.totalFee || 0,
                discount: student.discount || 0,
                netFee: student.netFee || 0,
                paidAmount: student.paidAmount || 0,
                remainingBalance: student.remainingBalance || 0,
                status: student.feeStatus || "pending",
                payments: [],
            },
            attendance: {
                totalClasses,
                presentCount,
                absentCount,
                lateCount,
                rate: `${attendanceRate}%`,
                history: attendanceRecords.map((a) => ({
                    date: a.date,
                    batch: a.batchName,
                    status: a.records[0]?.status,
                    remarks: a.records[0]?.remarks,
                })),
            },
            exams: examResults,
        });
    } catch (error) {
        console.error("Error in getStudentById:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch student profile" });
    }
};

// 4. Update Student Details
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Never allow changing password or role via general student update
        delete updates.password;
        delete updates.role;

        const student = await userModel.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }

        // If course or fee fields are updated, recalculate balances
        if (updates.totalFee !== undefined || updates.discount !== undefined) {
            const totalFee = updates.totalFee !== undefined ? parseFloat(updates.totalFee) : student.totalFee;
            const discount = updates.discount !== undefined ? parseFloat(updates.discount) : student.discount;
            updates.netFee = Math.max(0, totalFee - discount);
            updates.remainingBalance = Math.max(0, updates.netFee - student.paidAmount);

            if (student.paidAmount >= updates.netFee && updates.netFee > 0) {
                updates.feeStatus = "paid";
            } else if (student.paidAmount > 0) {
                updates.feeStatus = "partial";
            } else {
                updates.feeStatus = "pending";
            }

            // Sync with feeModel
            await feeModel.findOneAndUpdate(
                { studentId: student._id },
                {
                    totalFee,
                    discount,
                    netFee: updates.netFee,
                    remainingBalance: updates.remainingBalance,
                    status: updates.feeStatus,
                }
            );
        }

        Object.assign(student, updates);
        await student.save();

        await auditLogModel.create({
            action: "UPDATE_STUDENT",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(student._id),
            details: `Updated details for student ${student.fullName} (${student.studentId})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: "Student updated successfully",
            student,
        });
    } catch (error) {
        console.error("Error in updateStudent:", error);
        return res.status(500).json({ success: false, msg: "Failed to update student" });
    }
};

// 5. Delete Student (Safe Relationship Handling)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await userModel.findById(id);

        if (!student) {
            return res.status(404).json({ success: false, msg: "Student record not found" });
        }

        // Adjust batch enrollment
        if (student.batchId) {
            await batchModel.findByIdAndUpdate(student.batchId, {
                $inc: { currentEnrollment: -1 },
            });
        }

        // Audit log before removal
        await auditLogModel.create({
            action: "DELETE_STUDENT",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(student._id),
            details: `Deleted student ${student.fullName} (${student.studentId || student.email})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        await userModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            msg: `Student ${student.fullName} removed successfully.`,
        });
    } catch (error) {
        console.error("Error in deleteStudent:", error);
        return res.status(500).json({ success: false, msg: "Failed to delete student" });
    }
};

// 6. Toggle Active/Inactive Status
const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await userModel.findById(id);

        if (!student) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }

        student.isActive = !student.isActive;
        await student.save();

        await auditLogModel.create({
            action: student.isActive ? "ACTIVATE_STUDENT" : "DEACTIVATE_STUDENT",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(student._id),
            details: `Changed active status to ${student.isActive} for ${student.fullName}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Student account is now ${student.isActive ? "Active" : "Inactive"}.`,
            isActive: student.isActive,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to change student status" });
    }
};

// 7. Reset Student Password
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const student = await userModel.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }

        const passToSet = newPassword || "Student@123";
        student.password = await bcrypt.hash(passToSet, 10);
        student.mustChangePassword = true;
        await student.save();

        await auditLogModel.create({
            action: "RESET_STUDENT_PASSWORD",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(student._id),
            details: `Administrative password reset for student ${student.fullName} (${student.studentId})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Password reset successfully for ${student.fullName}. Temporary password assigned.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to reset password" });
    }
};

// 8. Bulk Activate/Deactivate
const bulkUpdateStatus = async (req, res) => {
    try {
        const { studentIds, isActive } = req.body;

        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ success: false, msg: "Please provide student IDs for bulk action" });
        }

        await userModel.updateMany({ _id: { $in: studentIds } }, { $set: { isActive: !!isActive } });

        await auditLogModel.create({
            action: "BULK_UPDATE_STUDENTS",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            details: `Bulk updated active status to ${isActive} for ${studentIds.length} students`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Successfully updated ${studentIds.length} students to ${isActive ? "Active" : "Inactive"}.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to perform bulk update" });
    }
};

module.exports = {
    getStudents,
    addStudent,
    getStudentById,
    updateStudent,
    deleteStudent,
    toggleStatus,
    resetPassword,
    bulkUpdateStatus,
};

