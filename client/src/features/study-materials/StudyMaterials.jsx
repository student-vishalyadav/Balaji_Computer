import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { materialAPI, courseAPI, batchAPI } from "../../services/api";
import {
    FileText,
    Download,
    Plus,
    Search,
    BookOpen,
    Trash2,
    CheckCircle,
    Eye,
    EyeOff,
    ExternalLink,
    HardDrive,
    FileSpreadsheet,
    FileCode,
    FileArchive,
} from "lucide-react";
import toast from "react-hot-toast";

export const StudyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [batchFilter, setBatchFilter] = useState("all");

    // Modal state
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        courseName: "",
        batchName: "All Batches",
        fileUrl: "",
        fileType: "PDF Document",
        fileSize: "3.5 MB",
    });

    // Fetch study materials
    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await materialAPI.getAll({
                course: courseFilter,
                batch: batchFilter,
            });
            if (res.success) {
                setMaterials(res.materials || []);
            }
        } catch (error) {
            toast.error(error.message || "Failed to load study materials");
        } finally {
            setLoading(false);
        }
    }, [courseFilter, batchFilter]);

    // Fetch courses & batches
    const fetchMetadata = async () => {
        try {
            const [cRes, bRes] = await Promise.all([courseAPI.getAll(), batchAPI.getAll()]);
            if (cRes.success) {
                setCourses(cRes.courses || []);
                if (cRes.courses?.length > 0) {
                    setForm((prev) => ({ ...prev, courseName: cRes.courses[0].name }));
                }
            }
            if (bRes.success) setBatches(bRes.batches || []);
        } catch {
            // non-blocking
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    // Filter materials by search term
    const filteredMaterials = materials.filter((m) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            m.title?.toLowerCase().includes(term) ||
            m.courseName?.toLowerCase().includes(term) ||
            m.description?.toLowerCase().includes(term)
        );
    });

    // Open upload modal
    const handleOpenUpload = () => {
        setForm({
            title: "",
            description: "",
            courseName: courses[0]?.name || "ADCA",
            batchName: "All Batches",
            fileUrl: "https://balajicomputer.edu/resources/handbook.pdf",
            fileType: "PDF Document",
            fileSize: "4.2 MB",
        });
        setUploadModalOpen(true);
    };

    // Submit upload
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.courseName || !form.fileUrl.trim()) {
            toast.error("Title, Course, and File Resource URL are required");
            return;
        }

        setUploading(true);
        try {
            const res = await materialAPI.create(form);
            if (res.success) {
                toast.success(res.msg || "Study material uploaded successfully");
                setUploadModalOpen(false);
                fetchMaterials();
            }
        } catch (error) {
            toast.error(error.message || "Failed to upload material");
        } finally {
            setUploading(false);
        }
    };

    // Toggle publish
    const handleTogglePublish = async (id) => {
        try {
            const res = await materialAPI.togglePublish(id);
            if (res.success) {
                toast.success(res.msg);
                setMaterials((prev) =>
                    prev.map((m) => (m._id === id ? { ...m, isPublished: res.isPublished } : m))
                );
            }
        } catch (error) {
            toast.error(error.message || "Failed to update publish status");
        }
    };

    // Download Handler
    const handleDownload = async (mat) => {
        try {
            // increment counter
            await fetch(`/api/materials/${mat._id}/download`);
            setMaterials((prev) =>
                prev.map((m) => (m._id === mat._id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m))
            );
            toast.success(`Downloading ${mat.title}`);
            window.open(mat.fileUrl, "_blank");
        } catch {
            window.open(mat.fileUrl, "_blank");
        }
    };

    // Delete Material
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            const res = await materialAPI.delete(id);
            if (res.success) {
                toast.success(res.msg || "Study material deleted");
                fetchMaterials();
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete material");
        }
    };

    // Get icon by file type
    const getFileIcon = (fileType = "") => {
        const type = fileType.toLowerCase();
        if (type.includes("pdf")) return <FileText className="w-6 h-6 text-red-500" />;
        if (type.includes("sheet") || type.includes("excel")) return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
        if (type.includes("code") || type.includes("zip")) return <FileCode className="w-6 h-6 text-blue-600" />;
        return <HardDrive className="w-6 h-6 text-slate-500" />;
    };

    // Stats
    const totalMaterials = materials.length;
    const totalDownloads = materials.reduce((acc, m) => acc + (m.downloadCount || 0), 0);
    const publishedCount = materials.filter((m) => m.isPublished).length;

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-blue-600" />
                        Study Materials & Digital Notes
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Distribute course handbooks, assignments, code references, and lab exercise manuals
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenUpload} icon={Plus}>
                    Upload Material
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Materials</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalMaterials}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Downloads</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalDownloads}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Published to Students</p>
                    <h3 className="text-2xl font-black text-amber-600 mt-1">{publishedCount}</h3>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search materials by title or topic..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

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
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        >
                            <option value="all">All Batches</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Materials List Cards */}
            {loading ? (
                <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading repository...</p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <Card className="p-16 text-center space-y-3 bg-white">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">No Study Materials Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Upload handbooks, cheat sheets, or assignment notes to help your students learn practical computer skills.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMaterials.map((mat) => (
                        <Card key={mat._id} className="p-5 flex flex-col justify-between bg-white shadow-xs hover:shadow-md transition-shadow">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        {getFileIcon(mat.fileType)}
                                    </div>
                                    <Badge variant={mat.isPublished ? "success" : "warning"} size="sm">
                                        {mat.isPublished ? "PUBLISHED" : "DRAFT"}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{mat.title}</h3>
                                    <p className="text-xs text-blue-600 font-semibold mt-0.5">
                                        {mat.courseName} • {mat.batchName || "All Batches"}
                                    </p>
                                    {mat.description && (
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                            {mat.description}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>{mat.fileType} • {mat.fileSize}</span>
                                    <span className="font-semibold text-slate-700">
                                        {mat.downloadCount || 0} downloads
                                    </span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleTogglePublish(mat._id)}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                            mat.isPublished
                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                : "text-slate-400 hover:bg-slate-100"
                                        }`}
                                        title={mat.isPublished ? "Unpublish Material" : "Publish Material"}
                                    >
                                        {mat.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(mat._id, mat.title)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Material"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <Button
                                    variant="outline"
                                    size="xs"
                                    onClick={() => handleDownload(mat)}
                                    icon={Download}
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                    Download
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL: UPLOAD STUDY MATERIAL */}
            <Modal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                title="Upload Study Material"
                subtitle="Share reference manuals, worksheets, and syllabus modules with students"
                size="md"
            >
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Document / Material Title *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. ADCA Semester 1 - MS Office & Practical Workbook"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Course *
                            </label>
                            <select
                                value={form.courseName}
                                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
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
                                Target Batch
                            </label>
                            <select
                                value={form.batchName}
                                onChange={(e) => setForm({ ...form, batchName: e.target.value })}
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
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                File Type
                            </label>
                            <select
                                value={form.fileType}
                                onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="PDF Document">PDF Document</option>
                                <option value="Word Document">Word Document (.docx)</option>
                                <option value="Excel Spreadsheet">Excel Workbook (.xlsx)</option>
                                <option value="ZIP Archive">ZIP Code Archive</option>
                                <option value="Lecture Video Link">Lecture Video Link</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                File Size
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 5.2 MB"
                                value={form.fileSize}
                                onChange={(e) => setForm({ ...form, fileSize: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            File URL / Cloud Storage Link *
                        </label>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/... or https://balajicomputer.edu/..."
                            value={form.fileUrl}
                            onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Description / Chapter Summary
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Briefly describe what this handbook or assignment covers..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setUploadModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" loading={uploading}>
                            Upload & Publish
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudyMaterials;
