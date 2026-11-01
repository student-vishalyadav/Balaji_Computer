import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { noticeAPI, courseAPI, batchAPI } from "../../services/api";
import {
    Bell,
    Plus,
    Calendar,
    AlertCircle,
    CheckCircle,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Search,
    ExternalLink,
    Paperclip,
    Users,
    Flame,
} from "lucide-react";
import toast from "react-hot-toast";

export const NoticeList = () => {
    const [notices, setNotices] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [audienceFilter, setAudienceFilter] = useState("all");

    // Modal state
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        _id: null,
        title: "",
        description: "",
        targetAudience: "All Students",
        targetDetail: "",
        priority: "normal",
        expiryDate: "",
        attachment: "",
    });

    // Fetch notices
    const fetchNotices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await noticeAPI.getAll({
                audience: audienceFilter,
            });
            if (res.success) {
                setNotices(res.notices || []);
            }
        } catch (error) {
            toast.error(error.message || "Failed to load notices");
        } finally {
            setLoading(false);
        }
    }, [audienceFilter]);

    // Fetch courses & batches for dropdown targets
    const fetchTargets = async () => {
        try {
            const [cRes, bRes] = await Promise.all([courseAPI.getAll(), batchAPI.getAll()]);
            if (cRes.success) setCourses(cRes.courses || []);
            if (bRes.success) setBatches(bRes.batches || []);
        } catch {
            // non-blocking
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    useEffect(() => {
        fetchTargets();
    }, []);

    // Filter by search term
    const filteredNotices = notices.filter((n) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            n.title?.toLowerCase().includes(term) ||
            n.description?.toLowerCase().includes(term) ||
            n.targetAudience?.toLowerCase().includes(term) ||
            n.targetDetail?.toLowerCase().includes(term)
        );
    });

    // Open Create Modal
    const handleOpenCreate = () => {
        setForm({
            _id: null,
            title: "",
            description: "",
            targetAudience: "All Students",
            targetDetail: "",
            priority: "normal",
            expiryDate: "",
            attachment: "",
        });
        setNoticeModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (notice) => {
        setForm({
            _id: notice._id,
            title: notice.title,
            description: notice.description,
            targetAudience: notice.targetAudience || "All Students",
            targetDetail: notice.targetDetail || "",
            priority: notice.priority || "normal",
            expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().slice(0, 10) : "",
            attachment: notice.attachment || "",
        });
        setNoticeModalOpen(true);
    };

    // Save Notice
    const handleSaveNotice = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Notice Title and Description are required");
            return;
        }

        setSaving(true);
        try {
            if (form._id) {
                const res = await noticeAPI.update(form._id, form);
                if (res.success) {
                    toast.success("Notice updated successfully");
                    setNoticeModalOpen(false);
                    fetchNotices();
                }
            } else {
                const res = await noticeAPI.create(form);
                if (res.success) {
                    toast.success("Notice published successfully");
                    setNoticeModalOpen(false);
                    fetchNotices();
                }
            }
        } catch (error) {
            toast.error(error.message || "Failed to save notice");
        } finally {
            setSaving(false);
        }
    };

    // Toggle publish
    const handleTogglePublish = async (id) => {
        try {
            const res = await noticeAPI.togglePublish(id);
            if (res.success) {
                toast.success(res.msg);
                setNotices((prev) =>
                    prev.map((n) => (n._id === id ? { ...n, isPublished: res.isPublished } : n))
                );
            }
        } catch (error) {
            toast.error(error.message || "Failed to update notice status");
        }
    };

    // Delete Notice
    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete notice "${title}"?`)) return;
        try {
            const res = await noticeAPI.delete(id);
            if (res.success) {
                toast.success(res.msg || "Notice deleted");
                fetchNotices();
            }
        } catch (error) {
            toast.error(error.message || "Failed to delete notice");
        }
    };

    // Stats
    const totalNotices = notices.length;
    const urgentCount = notices.filter((n) => n.priority === "urgent" || n.priority === "important").length;
    const activeBroadcasts = notices.filter((n) => n.isPublished).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Bell className="w-7 h-7 text-amber-500" />
                        Notice Board & Institute Announcements
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Broadcast timetable updates, exam notices, workshops, and administrative alerts
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenCreate} icon={Plus}>
                    Publish Notice
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Notices</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{totalNotices}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-red-500 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">High / Urgent Alerts</p>
                    <h3 className="text-2xl font-black text-red-600 mt-1">{urgentCount}</h3>
                </Card>
                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Live Broadcasts</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeBroadcasts}</h3>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search notices by title or content..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                        {[
                            { key: "all", label: "All Audiences" },
                            { key: "All Students", label: "All Students" },
                            { key: "Specific Course", label: "Course Wise" },
                            { key: "Specific Batch", label: "Batch Wise" },
                            { key: "Faculty", label: "Faculty Only" },
                        ].map((chip) => (
                            <button
                                key={chip.key}
                                onClick={() => setAudienceFilter(chip.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    audienceFilter === chip.key
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Notice Cards List */}
            {loading ? (
                <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Loading notice board...</p>
                </div>
            ) : filteredNotices.length === 0 ? (
                <Card className="p-16 text-center space-y-3 bg-white">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="text-base font-bold text-slate-800">No Announcements Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Publish new notices, holiday reminders, or exam timetable updates to communicate with students.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredNotices.map((n) => (
                        <Card
                            key={n._id}
                            className={`p-5 bg-white shadow-xs hover:shadow-md transition-shadow border-l-4 ${
                                n.priority === "urgent"
                                    ? "border-l-red-600 bg-red-50/10"
                                    : n.priority === "important"
                                    ? "border-l-amber-500 bg-amber-50/10"
                                    : "border-l-blue-600"
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="space-y-2 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            variant={
                                                n.priority === "urgent"
                                                    ? "danger"
                                                    : n.priority === "important"
                                                    ? "warning"
                                                    : "primary"
                                            }
                                            size="sm"
                                        >
                                            {n.priority?.toUpperCase()}
                                        </Badge>

                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                            <Users className="w-3 h-3 text-slate-400" />
                                            {n.targetAudience}
                                            {n.targetDetail ? `: ${n.targetDetail}` : ""}
                                        </span>

                                        <Badge variant={n.isPublished ? "success" : "warning"} size="sm">
                                            {n.isPublished ? "PUBLISHED" : "DRAFT"}
                                        </Badge>

                                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(n.publishDate || n.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                                        {n.title}
                                    </h3>

                                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                                        {n.description}
                                    </p>

                                    {n.attachment && (
                                        <div className="pt-1">
                                            <a
                                                href={n.attachment}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                                            >
                                                <Paperclip className="w-3.5 h-3.5" />
                                                View Attached Document
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0">
                                    <button
                                        onClick={() => handleTogglePublish(n._id)}
                                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                            n.isPublished
                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                : "text-slate-400 hover:bg-slate-100"
                                        }`}
                                        title={n.isPublished ? "Unpublish Notice" : "Publish Notice"}
                                    >
                                        {n.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenEdit(n)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                        title="Edit Notice"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(n._id, n.title)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                        title="Delete Notice"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* MODAL: CREATE / EDIT NOTICE */}
            <Modal
                isOpen={noticeModalOpen}
                onClose={() => setNoticeModalOpen(false)}
                title={form._id ? "Edit Announcement" : "Create New Announcement"}
                subtitle="Broadcast updates, schedules, and alerts to students and faculty"
                size="md"
            >
                <form onSubmit={handleSaveNotice} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Notice Title *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Special Sunday GST Invoicing & Tally Workshop"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Target Audience *
                            </label>
                            <select
                                value={form.targetAudience}
                                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="All Students">All Students</option>
                                <option value="Specific Course">Specific Course</option>
                                <option value="Specific Batch">Specific Batch</option>
                                <option value="Faculty">Faculty Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Priority Level *
                            </label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="normal">Normal Announcement</option>
                                <option value="important">Important Notification</option>
                                <option value="urgent">Urgent / High Priority Alert</option>
                            </select>
                        </div>
                    </div>

                    {/* Conditional Target Details */}
                    {form.targetAudience === "Specific Course" && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Select Course Target
                            </label>
                            <select
                                value={form.targetDetail}
                                onChange={(e) => setForm({ ...form, targetDetail: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="">Select Course...</option>
                                {courses.map((c) => (
                                    <option key={c._id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.targetAudience === "Specific Batch" && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Select Batch Target
                            </label>
                            <select
                                value={form.targetDetail}
                                onChange={(e) => setForm({ ...form, targetDetail: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="">Select Batch...</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b.name}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Expiry Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={form.expiryDate}
                                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Attachment URL (Optional)
                            </label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={form.attachment}
                                onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Notice Content / Details *
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Write the full announcement message here..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setNoticeModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" loading={saving}>
                            {form._id ? "Update Notice" : "Publish Announcement"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NoticeList;
