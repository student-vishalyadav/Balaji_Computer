const examModel = require("../models/examModel");
const auditLogModel = require("../models/auditLogModel");

// Get all exams
const getAllExams = async (req, res) => {
    try {
        const { course, status } = req.query;
        const query = {};
        if (course && course !== "all") query.courseName = course;
        if (status && status !== "all") query.status = status;

        const exams = await examModel.find(query).sort({ scheduledDate: -1 });

        return res.status(200).json({
            success: true,
            exams,
            count: exams.length,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to fetch exams" });
    }
};

// Create New Examination
const createExam = async (req, res) => {
    try {
        const {
            title,
            courseName,
            batchName = "All Batches",
            durationMinutes = 60,
            passingMarks = 20,
            negativeMarks = 0,
            scheduledDate,
            questions = [],
            status = "scheduled",
        } = req.body;

        if (!title || !courseName) {
            return res.status(400).json({ success: false, msg: "Exam Title and Course Name are required" });
        }

        const totalMarks = questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 2), 0) || 50;

        const newExam = await examModel.create({
            title: title.trim(),
            courseName: courseName.trim(),
            batchName: batchName || "All Batches",
            durationMinutes: parseInt(durationMinutes) || 60,
            totalMarks,
            passingMarks: parseInt(passingMarks) || 20,
            negativeMarks: parseFloat(negativeMarks) || 0,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
            status,
            questions: Array.isArray(questions) ? questions : [],
        });

        await auditLogModel.create({
            action: "CREATE_EXAM",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Exam",
            targetId: String(newExam._id),
            details: `Created examination "${newExam.title}" for ${newExam.courseName} with ${newExam.questions.length} questions`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(201).json({
            success: true,
            msg: `Examination "${newExam.title}" created successfully.`,
            exam: newExam,
        });
    } catch (error) {
        console.error("Error in createExam:", error);
        return res.status(500).json({ success: false, msg: error.message || "Failed to create examination" });
    }
};

// Update Examination Details / Questions
const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.questions && Array.isArray(updates.questions)) {
            updates.totalMarks = updates.questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 2), 0);
        }

        const updated = await examModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updated) {
            return res.status(404).json({ success: false, msg: "Examination not found" });
        }

        return res.status(200).json({
            success: true,
            msg: "Examination updated successfully",
            exam: updated,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to update exam" });
    }
};

// Publish Results / Record Student Results
const publishResults = async (req, res) => {
    try {
        const { id } = req.params;
        const { results } = req.body;

        const exam = await examModel.findById(id);
        if (!exam) {
            return res.status(404).json({ success: false, msg: "Exam not found" });
        }

        if (Array.isArray(results)) {
            exam.results = results;
        }

        exam.status = "results_published";
        await exam.save();

        await auditLogModel.create({
            action: "PUBLISH_EXAM_RESULTS",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Exam",
            targetId: String(exam._id),
            details: `Published examination results for "${exam.title}"`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Results for "${exam.title}" published successfully.`,
            exam,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to publish exam results" });
    }
};

// Delete Exam
const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await examModel.findByIdAndDelete(id);

        if (!exam) {
            return res.status(404).json({ success: false, msg: "Exam not found" });
        }

        return res.status(200).json({
            success: true,
            msg: `Exam "${exam.title}" deleted successfully.`,
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to delete exam" });
    }
};

module.exports = {
    getAllExams,
    createExam,
    updateExam,
    publishResults,
    deleteExam,
};

