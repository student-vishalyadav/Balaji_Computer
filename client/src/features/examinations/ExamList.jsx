import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { examAPI, courseAPI, batchAPI, studentAPI } from "../../services/api";
import {
    Award,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    BookOpen,
    Trash2,
    Edit3,
    FileCheck,
    Download,
    HelpCircle,
    X,
    TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal States
    const [examModalOpen, setExamModalOpen] = useState(false);
    const [resultsModalOpen, setResultsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [saving, setSaving] = useState(false);

    // Create / Edit Exam Form State
    const [examForm, setExamForm] = useState({
        _id: null,
        title: "",
        courseName: "",
        batchName: "All Batches",
        durationMinutes: 60,
        passingMarks: 20,
        negativeMarks: 0,
        scheduledDate: new Date().toISOString().slice(0, 16),
        status: "scheduled",
        questions: [
            {
                questionText: "What does HTML stand for in web development?",
                options: [
                    "Hyper Text Markup Language",
                    "High Tech Modern Language",
                    "Hyperlink and Text Model Language",
                    "Home Tool Management Language",
                ],
                correctOptionIndex: 0,
                marks: 2,
                explanation: "HTML is the standard markup language for creating web pages.",
            },
        ],
    });

    // Results State
    const [examResults, setExamResults] = useState([]);
    const [publishingResults, setPublishingResults] = useState(false);

    // Fetch exams
    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await examAPI.getAll({
                course: courseFilter,
                status: statusFilter,
            });
            if (res.success) {
                setExams(res.exams || []);
            }
        } catch (error) {
            toast.error(error.message || "Failed to load examinations");
        } finally {
            setLoading(false);
        }
    }, [courseFilter, statusFilter]);

    // Fetch courses & batches
    const fetchMetadata = async () => {
        try {
            const [cRes, bRes] = await Promise.all([courseAPI.getAll(), batchAPI.getAll()]);
            if (cRes.success) setCourses(cRes.courses || []);
            if (bRes.success) setBatches(bRes.batches || []);
        } catch {
            // non-blocking
        }
    };

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    // Open modal to create a new exam
    const handleOpenCreateModal = () => {
        const defaultCourse = courses[0]?.name || "ADCA";
        setExamForm({
            _id: null,
            title: "",
            courseName: defaultCourse,
            batchName: "All Batches",
            durationMinutes: 60,
            passingMarks: 20,
            negativeMarks: 0,
            scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
            status: "scheduled",
            questions: [
                {
                    questionText: "",
                    options: ["", "", "", ""],
                    correctOptionIndex: 0,
                    marks: 2,
                    explanation: "",
                },
            ],
        });
        setExamModalOpen(true);
    };

    // Open modal to edit existing exam
    const handleOpenEditModal = (exam) => {
        setExamForm({
            _id: exam._id,
            title: exam.title,
            courseName: exam.courseName,
            batchName: exam.batchName || "All Batches",
            durationMinutes: exam.durationMinutes || 60,
            passingMarks: exam.passingMarks || 20,
            negativeMarks: exam.negativeMarks || 0,
            scheduledDate: exam.scheduledDate ? new Date(exam.scheduledDate).toISOString().slice(0, 16) : "",
            status: exam.status || "scheduled",
            questions: exam.questions?.length > 0 ? exam.questions : [
                {
                    questionText: "",
                    options: ["", "", "", ""],
                    correctOptionIndex: 0,
                    marks: 2,
                    explanation: "",
                },
            ],
        });
        setExamModalOpen(true);
    };

    // Questions Management within Form
    const handleAddQuestion = () => {
        setExamForm((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    questionText: "",
                    options: ["", "", "", ""],
                    correctOptionIndex: 0,
                    marks: 2,
                    explanation: "",
                },
            ],
        }));
    };

    const handleRemoveQuestion = (idx) => {
        if (examForm.questions.length <= 1) {
            toast.error("An exam must have at least one question");
            return;
        }
        setExamForm((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== idx),
        }));
    };

    const handleUpdateQuestion = (qIndex, field, value) => {
        setExamForm((prev) => {
            const updated = [...prev.questions];
            updated[qIndex] = { ...updated[qIndex], [field]: value };
            return { ...prev, questions: updated };
        });
    };

    const handleUpdateOption = (qIndex, optIndex, value) => {
        setExamForm((prev) => {
            const updated = [...prev.questions];
            const newOpts = [...updated[qIndex].options];
            newOpts[optIndex] = value;
            updated[qIndex] = { ...updated[qIndex], options: newOpts };
            return { ...prev, questions: updated };
        });
    };

    // Save Exam (Create or Update)
    const handleSaveExam = async (e) => {
        e.preventDefault();
        if (!examForm.title.trim()) {
            toast.error("Exam Title is required");
            return;
        }
        if (!examForm.courseName) {
            toast.error("Please select a Course");
            return;
        }

        // Validate that all questions have questionText and at least 2 options
        for (let i = 0; i < examForm.questions.length; i++) {
            const q = examForm.questions[i];
            if (!q.questionText.trim()) {
                toast.error(`Question #${i + 1} text cannot be empty`);
                return;
            }
            if (q.options.some((opt) => !opt.trim())) {
                toast.error(`Please fill all 4 options for Question #${i + 1}`);
                return;
            }
        }

        setSaving(true);
        try {
            if (examForm._id) {
                const res = await examAPI.update(examForm._id, examForm);
                if (res.success) {
                    toast.success("Examination updated successfully");
                    setExamModalOpen(false);
                    fetchExams();
                }
            } else {
                const res = await examAPI.create(examForm);
                if (res.success) {
                    toast.success("Examination scheduled successfully");
                    setExamModalOpen(false);
                    fetchExams();
                }
            }
        } catch (error) {
            toast.error(error.message || "Failed to save examination");
        } finally {
            setSaving(false);
        }
    };

    // Delete Exam
    const handleDeleteExam = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete exam "${title}"?`)) return;
        try {
            const res = await examAPI.delete(id);
            if (res.success) {
                toast.success(res.msg || "Exam deleted");
                fetchExams();
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete exam");
        }
    };

    // Open Results Modal
    const handleOpenResults = async (exam) => {
        setSelectedExam(exam);
        if (exam.results && exam.results.length > 0) {
            setExamResults(exam.results);
            setResultsModalOpen(true);
        } else {
            // Load enrolled students for this course to generate initial result roster
            try {
                const res = await studentAPI.getAll({ course: exam.courseName, limit: 100 });
                const students = res.students || [];
                const initialResults = students.map((s) => ({
                    studentId: s._id,
                    studentName: s.fullName,
                    studentCode: s.studentId || "",
                    marksObtained: Math.round(exam.totalMarks * 0.75), // reasonable starting mark
                    totalMarks: exam.totalMarks,
                    percentage: 75,
                    status: "pass",
                    grade: "A",
                }));
                setExamResults(initialResults);
                setResultsModalOpen(true);
            } catch {
                setExamResults([]);
                setResultsModalOpen(true);
            }
        }
    };

    // Update individual score in results modal
    const handleScoreChange = (index, marks) => {
        const parsed = Math.max(0, parseFloat(marks) || 0);
        setExamResults((prev) => {
            const updated = [...prev];
            const total = selectedExam?.totalMarks || 50;
            const pct = Math.min(100, Math.round((parsed / total) * 100));
            const isPass = parsed >= (selectedExam?.passingMarks || 20);
            let grade = "F";
            if (pct >= 85) grade = "A+";
            else if (pct >= 75) grade = "A";
            else if (pct >= 60) grade = "B";
            else if (pct >= 45) grade = "C";

            updated[index] = {
                ...updated[index],
                marksObtained: parsed,
                percentage: pct,
                status: isPass ? "pass" : "fail",
                grade,
            };
            return updated;
        });
    };

    // Publish Results
    const handlePublishResults = async () => {
        if (!selectedExam) return;
        setPublishingResults(true);
        try {
            const res = await examAPI.publish(selectedExam._id, examResults);
            if (res.success) {
                toast.success(res.msg || "Results published successfully");
                setResultsModalOpen(false);
                fetchExams();
            }
        } catch (error) {
            toast.error(error.message || "Failed to publish results");
        } finally {
            setPublishingResults(false);
        }
    };

    // Export Exam Results CSV
    const handleExportResultsCSV = () => {
        if (!examResults || examResults.length === 0) {
            toast.error("No results to export");
            return;
        }

        const headers = ["Roll/Student ID", "Student Name", "Marks Obtained", "Total Marks", "Percentage", "Grade", "Status"];
        const rows = examResults.map((r) => [
            `"${r.studentCode || ""}"`,
            `"${r.studentName}"`,
            r.marksObtained,
            r.totalMarks,
            `${r.percentage}%`,
            r.grade,
            r.status?.toUpperCase(),
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${selectedExam?.title || "Exam"}_Results_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Metrics
    const totalExams = exams.length;
    const scheduledCount = exams.filter((e) => e.status === "scheduled").length;
    const publishedCount = exams.filter((e) => e.status === "results_published").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Award className="w-7 h-7 text-blue-600" />
                        Online Examination & Assessment System
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Schedule MCQ theory & practical exams, build question banks, and evaluate student marks
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenCreateModal} icon={Plus}>
                    Schedule Exam
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Exams</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalExams}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming / Scheduled</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{scheduledCount}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Results Published</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</h3>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        >
                            <option value="all">All Courses</option>
                            {courses.map((c) => (
                                <option key={c._id} value={c.name}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        >
                            <option value="all">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="results_published">Results Published</option>
                        </select>
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                        Showing {exams.length} examinations
                    </span>
                </div>
            </Card>

            {/* Examinations Cards List */}
            {loading ? (
                <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading examinations...</p>
                </div>
            ) : exams.length === 0 ? (
                <Card className="p-16 text-center space-y-3 bg-white">
                    <Award className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">No Examinations Scheduled</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Get started by clicking the "Schedule Exam" button to create an MCQ online test.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exams.map((exam) => (
                        <Card key={exam._id} className="p-5 flex flex-col justify-between bg-white shadow-xs hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <Badge
                                        variant={
                                            exam.status === "results_published"
                                                ? "success"
                                                : exam.status === "scheduled"
                                                ? "primary"
                                                : "warning"
                                        }
                                        size="sm"
                                    >
                                        {exam.status === "results_published" ? "RESULTS PUBLISHED" : exam.status?.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs font-mono font-bold text-slate-400">
                                        {exam.questions?.length || 0} Questions
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{exam.title}</h3>
                                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{exam.courseName} • {exam.batchName}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{exam.durationMinutes} mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Pass: {exam.passingMarks}/{exam.totalMarks}</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                            {exam.scheduledDate
                                                ? new Date(exam.scheduledDate).toLocaleDateString("en-IN", {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                  })
                                                : "Flexible Date"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenEditModal(exam)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Exam"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteExam(exam._id, exam.title)}
                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Exam"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <Button
                                    variant={exam.status === "results_published" ? "outline" : "primary"}
                                    size="xs"
                                    onClick={() => handleOpenResults(exam)}
                                    icon={FileCheck}
                                >
                                    {exam.status === "results_published" ? "View Results" : "Publish Results"}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL 1: CREATE / EDIT EXAM WITH QUESTION BUILDER */}
            <Modal
                isOpen={examModalOpen}
                onClose={() => setExamModalOpen(false)}
                title={examForm._id ? "Edit Examination" : "Schedule New Examination"}
                subtitle="Configure assessment timing, pass criteria, and MCQ question bank"
                size="xl"
            >
                <form onSubmit={handleSaveExam} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Exam Title *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. ADCA Semester 1 - MS Office & Computer Fundamentals"
                                value={examForm.title}
                                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Course *
                            </label>
                            <select
                                value={examForm.courseName}
                                onChange={(e) => setExamForm({ ...examForm, courseName: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            >
                                {courses.map((c) => (
                                    <option key={c._id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Batch
                            </label>
                            <select
                                value={examForm.batchName}
                                onChange={(e) => setExamForm({ ...examForm, batchName: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="All Batches">All Batches</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b.name}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={examForm.scheduledDate}
                                onChange={(e) => setExamForm({ ...examForm, scheduledDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                value={examForm.durationMinutes}
                                onChange={(e) => setExamForm({ ...examForm, durationMinutes: parseInt(e.target.value) || 60 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                min="10"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Passing Marks
                            </label>
                            <input
                                type="number"
                                value={examForm.passingMarks}
                                onChange={(e) => setExamForm({ ...examForm, passingMarks: parseInt(e.target.value) || 20 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Negative Marking per wrong answer
                            </label>
                            <input
                                type="number"
                                step="0.25"
                                value={examForm.negativeMarks}
                                onChange={(e) => setExamForm({ ...examForm, negativeMarks: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Question Bank Builder */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">MCQ Question Bank</h4>
                                <p className="text-xs text-slate-500">
                                    Total Questions: {examForm.questions.length} • Total Marks:{" "}
                                    {examForm.questions.reduce((sum, q) => sum + (parseFloat(q.marks) || 2), 0)}
                                </p>
                            </div>
                            <Button variant="outline" size="xs" onClick={handleAddQuestion} icon={Plus}>
                                Add Question
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                            {examForm.questions.map((q, qIdx) => (
                                <div key={qIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-blue-600 uppercase">
                                            Question #{qIdx + 1}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <label className="text-[11px] text-slate-500 font-bold">Marks:</label>
                                                <input
                                                    type="number"
                                                    value={q.marks}
                                                    onChange={(e) => handleUpdateQuestion(qIdx, "marks", parseFloat(e.target.value) || 2)}
                                                    className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-center"
                                                    min="1"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(qIdx)}
                                                className="text-slate-400 hover:text-red-500 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <input
                                        type="text"
                                        placeholder={`Enter Question #${qIdx + 1}...`}
                                        value={q.questionText}
                                        onChange={(e) => handleUpdateQuestion(qIdx, "questionText", e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        required
                                    />

                                    {/* 4 Options */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {["A", "B", "C", "D"].map((letter, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                                    q.correctOptionIndex === optIdx
                                                        ? "bg-emerald-50 border-emerald-300"
                                                        : "bg-white border-slate-200"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correctOpt-${qIdx}`}
                                                    checked={q.correctOptionIndex === optIdx}
                                                    onChange={() => handleUpdateQuestion(qIdx, "correctOptionIndex", optIdx)}
                                                    className="accent-emerald-600 cursor-pointer"
                                                />
                                                <span className="font-bold text-slate-600">{letter}.</span>
                                                <input
                                                    type="text"
                                                    placeholder={`Option ${letter}`}
                                                    value={q.options[optIdx] || ""}
                                                    onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                                    className="w-full bg-transparent border-none text-xs text-slate-900 focus:outline-hidden"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setExamModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" loading={saving}>
                            {examForm._id ? "Update Examination" : "Save & Schedule"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: PUBLISH RESULTS & VIEW SCORES */}
            <Modal
                isOpen={resultsModalOpen}
                onClose={() => setResultsModalOpen(false)}
                title={`Results & Evaluation: ${selectedExam?.title || "Exam"}`}
                subtitle={`Total Marks: ${selectedExam?.totalMarks || 50} • Passing Marks: ${selectedExam?.passingMarks || 20}`}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                            Enrolled Student Submissions ({examResults.length})
                        </span>
                        <Button variant="outline" size="xs" onClick={handleExportResultsCSV} icon={Download}>
                            Export CSV
                        </Button>
                    </div>

                    {examResults.length === 0 ? (
                        <p className="text-xs text-slate-400 py-8 text-center">
                            No student scores submitted yet.
                        </p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {examResults.map((r, i) => (
                                <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-900 truncate">{r.studentName}</p>
                                        <span className="text-[11px] text-slate-400 font-mono">
                                            {r.studentCode || "Roll N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <label className="text-[11px] text-slate-500">Marks:</label>
                                            <input
                                                type="number"
                                                value={r.marksObtained}
                                                onChange={(e) => handleScoreChange(i, e.target.value)}
                                                className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-center"
                                                min="0"
                                                max={selectedExam?.totalMarks || 100}
                                            />
                                        </div>

                                        <span className="font-bold text-slate-700 w-12 text-right">
                                            {r.percentage}%
                                        </span>

                                        <Badge
                                            variant={r.status === "pass" ? "success" : "danger"}
                                            size="sm"
                                        >
                                            {r.grade} • {r.status?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setResultsModalOpen(false)}>
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handlePublishResults}
                            loading={publishingResults}
                            icon={CheckCircle2}
                        >
                            Publish Results to Students
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExamList;
