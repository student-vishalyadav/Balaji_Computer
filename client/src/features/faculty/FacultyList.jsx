import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Plus,
    UserCheck,
    Mail,
    Phone,
    GraduationCap,
    Award,
    Edit,
    Trash2,
    BookOpen,
    Layers,
    Search,
    RefreshCw,
    X,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import { facultyAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import PageHeader from "../../components/common/PageHeader";
import toast from "react-hot-toast";

export const FacultyList = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");

    const [faculty, setFaculty] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        qualification: "",
        experience: "",
        specialization: "",
        assignedCourses: "",
        assignedBatches: "",
        isActive: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const fetchFaculty = async () => {
        setIsLoading(true);
        try {
            const res = await facultyAPI.getAll({ search });
            if (res?.success) {
                setFaculty(res.faculty || []);
            }
        } catch (err) {
            toast.error("Failed to load faculty list");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchFaculty();
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleOpenAdd = () => {
        setEditingFaculty(null);
        setFormData({
            fullName: "",
            email: "",
            mobile: "",
            qualification: "MCA / B.Tech",
            experience: "5+ Years",
            specialization: "Computer Applications",
            assignedCourses: "ADCA, DCA",
            assignedBatches: "Morning Batch",
            isActive: true,
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (f) => {
        setEditingFaculty(f);
        setFormData({
            fullName: f.fullName,
            email: f.email,
            mobile: f.mobile || "",
            qualification: f.qualification || "",
            experience: f.experience || "",
            specialization: f.specialization || "",
            assignedCourses: Array.isArray(f.assignedCourses) ? f.assignedCourses.join(", ") : f.assignedCourses || "",
            assignedBatches: Array.isArray(f.assignedBatches) ? f.assignedBatches.join(", ") : f.assignedBatches || "",
            isActive: f.isActive !== false,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to remove faculty member ${name}?`)) return;
        try {
            const res = await facultyAPI.delete(id);
            if (res?.success) {
                toast.success(res.msg || "Faculty removed successfully");
                fetchFaculty();
            }
        } catch (err) {
            toast.error(err.message || "Failed to remove faculty");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.mobile) {
            toast.error("Full Name, Email, and Mobile are required");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                assignedCourses: typeof formData.assignedCourses === "string"
                    ? formData.assignedCourses.split(",").map((s) => s.trim()).filter(Boolean)
                    : formData.assignedCourses || [],
                assignedBatches: typeof formData.assignedBatches === "string"
                    ? formData.assignedBatches.split(",").map((s) => s.trim()).filter(Boolean)
                    : formData.assignedBatches || [],
            };

            if (editingFaculty) {
                const res = await facultyAPI.update(editingFaculty._id, payload);
                if (res?.success) {
                    toast.success(res.msg || "Faculty profile updated successfully");
                    setModalOpen(false);
                    fetchFaculty();
                }
            } else {
                const res = await facultyAPI.create(payload);
                if (res?.success) {
                    toast.success(res.msg || "Faculty profile created successfully");
                    setModalOpen(false);
                    fetchFaculty();
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || err.message || "Failed to save faculty");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to format assigned courses cleanly into tag array
    const parseCourses = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) {
            return val.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
        }
        if (typeof val === "string") {
            return val.split(",").map((s) => s.trim()).filter(Boolean);
        }
        return [];
    };

    // Main faculty content view
    const mainContent = (
        <div className="w-full space-y-6">
            {/* Admin Header */}
            {isAdmin && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight break-words">
                            Faculty Management
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">
                            Directory of expert lab instructors, accounting trainers, and programming mentors
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleOpenAdd}
                        icon={Plus}
                        className="self-start sm:self-auto shrink-0 shadow-xs"
                    >
                        Add New Faculty
                    </Button>
                </div>
            )}

            {/* Responsive Search and Filtering Bar */}
            <Card padding="p-3 sm:p-4" className="border-slate-200/80 shadow-xs">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search faculty by name, email, specialization, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all min-w-0"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                                title="Clear search filter"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Results Counter & Refresh Button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                            {isLoading ? (
                                <span className="inline-flex items-center gap-1.5 text-blue-600">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Searching...
                                </span>
                            ) : (
                                <>
                                    <span className="font-semibold text-slate-900">{faculty.length}</span>{" "}
                                    {faculty.length === 1 ? "instructor" : "instructors"} found
                                </>
                            )}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchFaculty}
                            disabled={isLoading}
                            icon={RefreshCw}
                            className={`text-slate-600 hover:text-blue-600 ${isLoading ? "animate-spin" : ""}`}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Faculty Responsive Cards Grid */}
            {isLoading ? (
                <div id="faculty-grid-loading" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="h-72 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-2 pt-3 border-t border-slate-100">
                                    <div className="h-3 bg-slate-100 rounded-md w-4/5" />
                                    <div className="h-3 bg-slate-100 rounded-md w-3/5" />
                                </div>
                            </div>
                            <div className="h-8 bg-slate-100 rounded-xl w-full" />
                        </div>
                    ))}
                </div>
            ) : faculty.length > 0 ? (
                <div id="faculty-grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 w-full">
                    {faculty.map((f) => {
                        const courses = parseCourses(f.assignedCourses);
                        return (
                            <Card
                                key={f._id}
                                hoverable={true}
                                padding="p-5 sm:p-6"
                                data-faculty-card="true"
                                className="border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full min-w-0"
                            >
                                {/* Top and Body Section */}
                                <div className="flex-1 min-w-0 space-y-4">
                                    {/* Header: Avatar, Name, Specialization, Status Badge */}
                                    <div className="flex items-start justify-between gap-2.5 sm:gap-3 min-w-0">
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            {/* Avatar with initial */}
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-base sm:text-lg shrink-0 shadow-xs ring-2 ring-blue-50">
                                                {f.fullName ? f.fullName[0].toUpperCase() : "F"}
                                            </div>
                                            {/* Name & Specialization */}
                                            <div className="min-w-0 flex-1">
                                                <h3
                                                    className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words"
                                                    title={f.fullName}
                                                >
                                                    {f.fullName}
                                                </h3>
                                                <p className="text-xs text-blue-600 font-semibold mt-0.5 break-words leading-tight">
                                                    {f.specialization || "Faculty Instructor"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0">
                                            <Badge variant={f.isActive ? "success" : "secondary"} size="sm">
                                                {f.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Faculty Credentials & Contact Details */}
                                    <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100 min-w-0">
                                        {/* Qualification & Experience */}
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <span className="min-w-0 break-words font-medium text-slate-700">
                                                {f.qualification || "Qualified Faculty"}
                                                {f.experience ? ` (${f.experience})` : ""}
                                            </span>
                                        </div>

                                        {/* Email Address */}
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <a
                                                href={`mailto:${f.email}`}
                                                className="min-w-0 break-all text-slate-600 hover:text-blue-600 transition-colors"
                                                title={f.email}
                                            >
                                                {f.email}
                                            </a>
                                        </div>

                                        {/* Contact Phone */}
                                        {f.mobile && (
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                                <a
                                                    href={`tel:${f.mobile}`}
                                                    className="min-w-0 break-words font-medium text-slate-700 hover:text-blue-600 transition-colors"
                                                >
                                                    {f.mobile}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assigned Academic Programs */}
                                    {courses.length > 0 && (
                                        <div className="pt-3 border-t border-slate-100 min-w-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                                Assigned Programs:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 min-w-0">
                                                {courses.map((course, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100/80 break-words"
                                                    >
                                                        {course}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assigned Batches (if configured) */}
                                    {f.assignedBatches && (
                                        (Array.isArray(f.assignedBatches) ? f.assignedBatches.length > 0 : String(f.assignedBatches).trim()) && (
                                            <div className="pt-2 min-w-0">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                                    Active Batches:
                                                </span>
                                                <p className="text-xs text-slate-600 break-words">
                                                    {Array.isArray(f.assignedBatches)
                                                        ? f.assignedBatches.join(", ")
                                                        : f.assignedBatches}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Admin Actions Pinned to Bottom */}
                                {isAdmin && (
                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEdit(f)}
                                            icon={Edit}
                                            className="hover:border-blue-300 hover:text-blue-600"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 border-red-200"
                                            onClick={() => handleDelete(f._id, f.fullName)}
                                            icon={Trash2}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* Empty Search Results State */
                <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 max-w-lg mx-auto shadow-xs">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <UserCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base">No Faculty Found</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 break-words">
                        {search
                            ? `No instructor matched "${search}". Try another keyword or clear the search filter.`
                            : "No faculty profiles are currently registered."}
                    </p>
                    {search && (
                        <Button variant="outline" size="sm" onClick={() => setSearch("")} className="mt-4">
                            Clear Search Filter
                        </Button>
                    )}
                </div>
            )}

            {/* Add / Edit Faculty Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
                subtitle="Configure instructor credentials, specialization and course assignments"
                size="md"
                footer={
                    <div className="flex items-center justify-end gap-2.5 w-full">
                        <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" onClick={handleSubmit} loading={isSaving}>
                            {editingFaculty ? "Save Updates" : "Add Faculty"}
                        </Button>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <Input
                        label="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Er. Suresh Verma"
                        required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="faculty@balajicomputer.edu"
                            required
                        />
                        <Input
                            label="Mobile Phone"
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="9876543210"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Qualification"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            placeholder="MCA, B.Tech, M.Com"
                        />
                        <Input
                            label="Experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            placeholder="8+ Years"
                        />
                    </div>
                    <Input
                        label="Specialization / Subject"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g. Tally Prime with GST, Full Stack MERN"
                    />
                    <Input
                        label="Assigned Courses (comma separated)"
                        value={formData.assignedCourses}
                        onChange={(e) => setFormData({ ...formData, assignedCourses: e.target.value })}
                        placeholder="ADCA, DCA, Tally Prime"
                    />
                    <Input
                        label="Assigned Batches (comma separated)"
                        value={formData.assignedBatches}
                        onChange={(e) => setFormData({ ...formData, assignedBatches: e.target.value })}
                        placeholder="Morning Alpha Batch, Evening Executive"
                    />
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="isActiveFaculty"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                        <label htmlFor="isActiveFaculty" className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none">
                            Active Faculty Member (Visible on public directory)
                        </label>
                    </div>
                </form>
            </Modal>
        </div>
    );

    // If viewed on public portal (/faculty), render page hero header and centered max-w container
    if (!isAdmin) {
        return (
            <div className="min-h-[80vh] pb-16">
                <PageHeader
                    title="Our Distinguished Faculty"
                    subtitle="Meet our certified computer instructors, accounting trainers, and programming mentors dedicated to student success."
                    badge="Academic Mentors"
                    breadcrumbs={[{ label: "Our Faculty" }]}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6 sm:space-y-8">
                    {mainContent}
                </div>
            </div>
        );
    }

    // In Admin context (/admin/faculty), render within the AdminLayout viewport
    return mainContent;
};

export default FacultyList;