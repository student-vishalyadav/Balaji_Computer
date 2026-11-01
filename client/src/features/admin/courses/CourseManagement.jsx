import React, { useState, useEffect } from "react";
import {
    Plus,
    BookOpen,
    Clock,
    DollarSign,
    Award,
    Edit,
    Trash2,
    Star,
    Layers,
    Search,
    CheckCircle,
} from "lucide-react";
import { courseAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import toast from "react-hot-toast";

export const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        shortDescription: "",
        description: "",
        duration: "6 Months",
        fee: 6500,
        discountFee: 5499,
        level: "Beginner",
        category: "Diploma Courses",
        badge: "Job Oriented",
        syllabusText: "",
        isPopular: true,
        isActive: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await courseAPI.getAll();
            if (res?.success) {
                setCourses(res.courses || []);
            }
        } catch (err) {
            toast.error("Failed to load courses");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleOpenAdd = () => {
        setEditingCourse(null);
        setFormData({
            title: "",
            code: "",
            shortDescription: "",
            description: "",
            duration: "6 Months",
            fee: 6500,
            discountFee: 5499,
            level: "Beginner",
            category: "Diploma Courses",
            badge: "Job Oriented",
            syllabusText: "Module 1: Computer Fundamentals\nModule 2: MS Office Automation\nModule 3: Internet & Typing Practice",
            isPopular: true,
            isActive: true,
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (c) => {
        setEditingCourse(c);
        setFormData({
            title: c.title,
            code: c.code,
            shortDescription: c.shortDescription || "",
            description: c.description || "",
            duration: c.duration || "6 Months",
            fee: c.fee || 0,
            discountFee: c.discountFee || 0,
            level: c.level || "Beginner",
            category: c.category || "Diploma Courses",
            badge: c.badge || "",
            syllabusText: Array.isArray(c.syllabus) ? c.syllabus.join("\n") : "",
            isPopular: c.isPopular !== false,
            isActive: c.isActive !== false,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete course "${title}"?`)) return;
        try {
            const res = await courseAPI.delete(id);
            if (res?.success) {
                toast.success(res.msg);
                fetchCourses();
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete course");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.code) {
            toast.error("Course Title and Code are required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase().trim(),
                fee: parseFloat(formData.fee) || 0,
                discountFee: parseFloat(formData.discountFee) || 0,
                syllabus: formData.syllabusText
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
            };

            if (editingCourse) {
                const res = await courseAPI.update(editingCourse._id, payload);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchCourses();
                }
            } else {
                const res = await courseAPI.create(payload);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchCourses();
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to save course");
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = courses.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage institute diplomas, syllabus modules, fee structures and featured programs
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={Plus}>
                    Add New Course
                </Button>
            </div>

            <Card className="p-4 border-slate-200">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search courses by name or code (e.g. ADCA, Tally)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                </div>
            </Card>

            {/* Courses Table */}
            <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="p-4">Code</th>
                                <th className="p-4">Course Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Course Fee</th>
                                <th className="p-4">Badge</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        Loading course catalog...
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((c) => (
                                    <tr key={c._id || c.code} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-mono font-bold text-blue-600">{c.code}</td>
                                        <td className="p-4 font-bold text-slate-900 max-w-xs">{c.title}</td>
                                        <td className="p-4 text-slate-600">{c.category}</td>
                                        <td className="p-4 text-slate-600">{c.duration}</td>
                                        <td className="p-4 font-bold text-slate-900">
                                            ₹{(c.discountFee || c.fee).toLocaleString("en-IN")}
                                        </td>
                                        <td className="p-4">
                                            {c.badge && <Badge variant="warning" size="sm">{c.badge}</Badge>}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={c.isActive !== false ? "success" : "secondary"} size="sm">
                                                {c.isActive !== false ? "Active" : "Archived"}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEdit(c)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                                    title="Edit Course"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c._id, c.title)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                                    title="Delete Course"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        No courses found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add / Edit Course Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCourse ? "Edit Course" : "Add New Course"}
                subtitle="Configure curriculum details, duration, syllabus modules & tuition fee"
                size="lg"
                footer={
                    <>
                        <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" onClick={handleSubmit} loading={isSaving}>
                            {editingCourse ? "Save Updates" : "Create Course"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <Input
                                label="Course Name"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Advanced Diploma in Computer Applications (ADCA)"
                                required
                            />
                        </div>
                        <Input
                            label="Course Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. ADCA"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            label="Duration"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="12 Months / 6 Months"
                            required
                        />
                        <Input
                            label="Standard Fee (₹)"
                            type="number"
                            value={formData.fee}
                            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                            required
                        />
                        <Input
                            label="Discounted Fee (₹)"
                            type="number"
                            value={formData.discountFee}
                            onChange={(e) => setFormData({ ...formData, discountFee: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                            >
                                <option value="Diploma Courses">Diploma Courses</option>
                                <option value="Accounting">Accounting</option>
                                <option value="Programming">Programming</option>
                                <option value="Design">Design</option>
                                <option value="Certification">Certification</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Difficulty Level
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="All Levels">All Levels</option>
                            </select>
                        </div>
                        <Input
                            label="Promotional Badge"
                            value={formData.badge}
                            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                            placeholder="e.g. Most Popular"
                        />
                    </div>

                    <Input
                        label="Short Description"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        placeholder="Brief summary for course cards"
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Full Syllabus Modules (one module per line)
                        </label>
                        <textarea
                            rows={4}
                            value={formData.syllabusText}
                            onChange={(e) => setFormData({ ...formData, syllabusText: e.target.value })}
                            placeholder="Module 1: Computer Fundamentals&#10;Module 2: MS Office Suite&#10;Module 3: Tally Prime"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CourseManagement;

