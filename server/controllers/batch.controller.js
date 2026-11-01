const batchModel = require("../models/batchModel");
const userModel = require("../models/userModel");
const auditLogModel = require("../models/auditLogModel");

// Get all batches
const getAllBatches = async (req, res) => {
    try {
        const { course, status } = req.query;
        const query = {};
        if (course && course !== "all") query.courseName = course;
        if (status && status !== "all") query.status = status;

        const batches = await batchModel.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            batches,
            count: batches.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to fetch batches" });
    }
};

// Create Batch
const createBatch = async (req, res) => {
    try {
        const { name, courseName, facultyName, timing, classroom, maxStudents, startDate, endDate, status } = req.body;

        if (!name || !courseName || !timing) {
            return res.status(400).json({ success: false, msg: "Batch Name, Course, and Timing are required" });
        }

        const existing = await batchModel.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ success: false, msg: "A batch with this name already exists" });
        }

        const newBatch = await batchModel.create({
            name: name.trim(),
            courseName: courseName.trim(),
            facultyName: facultyName || "To Be Assigned",
            timing: timing.trim(),
            classroom: classroom || "Main Lab",
            maxStudents: maxStudents || 30,
            startDate: startDate ? new Date(startDate) : new Date(),
            endDate: endDate ? new Date(endDate) : null,
            status: status || "active",
        });

        await auditLogModel.create({
            action: "CREATE_BATCH",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Batch",
            targetId: String(newBatch._id),
            details: `Created batch ${newBatch.name} (${newBatch.timing})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Batch ${newBatch.name} created successfully.`,
            batch: newBatch,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message || "Failed to create batch" });
    }
};

// Update Batch
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await batchModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updated) {
            return res.status(404).json({ success: false, msg: "Batch not found" });
        }

        await auditLogModel.create({
            action: "UPDATE_BATCH",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Batch",
            targetId: String(updated._id),
            details: `Updated batch ${updated.name}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: "Batch details updated successfully",
            batch: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update batch" });
    }
};

// Delete Batch
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await batchModel.findByIdAndDelete(id);

        if (!batch) {
            return res.status(404).json({ success: false, msg: "Batch not found" });
        }

        // Unlink students assigned to this batch
        await userModel.updateMany({ batchId: id }, { $set: { batchId: null, batchName: "Unassigned" } });

        await auditLogModel.create({
            action: "DELETE_BATCH",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Batch",
            targetId: String(id),
            details: `Deleted batch ${batch.name}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Batch ${batch.name} deleted successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete batch" });
    }
};

// Get Batch-wise Students List
const getBatchStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await batchModel.findById(id);

        if (!batch) {
            return res.status(404).json({ success: false, msg: "Batch not found" });
        }

        const students = await userModel
            .find({ $or: [{ batchId: batch._id }, { batchName: batch.name }], role: "student" })
            .select("studentId fullName email mobile feeStatus isActive");

        return res.status(200).json({
            success: true,
            batch,
            students,
            count: students.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to fetch batch students" });
    }
};

// Transfer Student to Batch
const transferStudent = async (req, res) => {
    try {
        const { studentId, targetBatchId } = req.body;

        const student = await userModel.findById(studentId);
        const targetBatch = await batchModel.findById(targetBatchId);

        if (!student || !targetBatch) {
            return res.status(404).json({ success: false, msg: "Student or target batch not found" });
        }

        // Decrement old batch enrollment
        if (student.batchId) {
            await batchModel.findByIdAndUpdate(student.batchId, { $inc: { currentEnrollment: -1 } });
        }

        // Increment target batch enrollment
        targetBatch.currentEnrollment = (targetBatch.currentEnrollment || 0) + 1;
        await targetBatch.save();

        student.batchId = targetBatch._id;
        student.batchName = targetBatch.name;
        await student.save();

        await auditLogModel.create({
            action: "TRANSFER_STUDENT_BATCH",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Student",
            targetId: String(student._id),
            details: `Transferred ${student.fullName} to batch ${targetBatch.name}`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Transferred ${student.fullName} to ${targetBatch.name} successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to transfer student" });
    }
};

module.exports = {
    getAllBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    getBatchStudents,
    transferStudent,
};

