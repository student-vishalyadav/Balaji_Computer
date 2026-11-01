import React, { useState, useEffect } from "react";
import {
    Plus,
    Clock,
    Users,
    Layers,
    Edit,
    Trash2,
    Calendar,
    ArrowRightLeft,
    CheckCircle,
} from "lucide-react";
import { batchAPI, courseAPI, facultyAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export const BatchList = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        courseName: "",
        facultyName: "",
        timing: "10:00 AM - 12:00 PM",
        classroom: "Lab 1",
        maxStudents: 30,
        status: "active",
    });
    const [isSaving, setIsSaving] = useState(false);

    // View Batch Students modal
    const [studentsModalOpen, setStudentsModalOpen] = useState(false);
    const [activeBatchStudents, setActiveBatchStudents] = useState([]);
    const [selectedBatchName, setSelectedBatchName] = useState("");

    const fetchBatches = async () => {
        setIsLoading(true);
        try {
            const [bRes, cRes, fRes] = await Promise.all([
                batchAPI.getAll(),
                courseAPI.getAll(),
                facultyAPI.getAll(),
            ]);
            if (bRes?.success) setBatches(bRes.batches || []);
            if (cRes?.courses) setCourses(cRes.courses);
            if (fRes?.faculty) setFacultyList(fRes.faculty);
        } catch (err) {
            toast.error("Failed to load batches");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleOpenAdd = () => {
        setEditingBatch(null);
        setFormData({
            name: "",
            courseName: courses[0]?.title || "ADCA",
            facultyName: facultyList[0]?.fullName || "Er. Suresh Verma",
            timing: "10:00 AM - 12:00 PM",
            classroom: "Lab 1",
            maxStudents: 30,
            status: "active",
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (b) => {
        setEditingBatch(b);
        setFormData({
            name: b.name,
            courseName: b.courseName,
            facultyName: b.facultyName,
            timing: b.timing,
            classroom: b.classroom || "Main Lab",
            maxStudents: b.maxStudents || 30,
            status: b.status || "active",
        });
        setModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete batch "${name}"?`)) return;
        try {
            const res = await batchAPI.delete(id);
            if (res?.success) {
                toast.success(res.msg);
                fetchBatches();
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete batch");
        }
    };

    const handleViewStudents = async (id, name) => {
        setSelectedBatchName(name);
        try {
            const res = await batchAPI.getStudents(id);
            if (res?.success) {
                setActiveBatchStudents(res.students || []);
                setStudentsModalOpen(true);
            }
        } catch (err) {
            toast.error("Failed to load batch students");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.courseName || !formData.timing) {
            toast.error("Batch Name, Course, and Timing are required");
            return;
        }

        setIsSaving(true);
        try {
            if (editingBatch) {
                const res = await batchAPI.update(editingBatch._id, formData);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchBatches();
                }
            } else {
                const res = await batchAPI.create(formData);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchBatches();
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to save batch");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Batch Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage classroom slots, lab workstation allocations, and faculty assignments
                    </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={Plus}>
                    Create New Batch
                </Button>
            </div>

            {/* Batches Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200" />
                    ))}
                </div>
            ) : batches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((b) => {
                        const enrollmentPct = Math.round(((b.currentEnrollment || 0) / (b.maxStudents || 30)) * 100);
                        return (
                            <Card key={b._id} hoverable={true} className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                                            <p className="text-xs text-blue-600 font-semibold mt-0.5">{b.courseName}</p>
                                        </div>
                                        <Badge variant={b.status === "active" ? "success" : "secondary"} size="sm">
                                            {b.status?.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" /> Class Timing:
                                            </span>
                                            <span className="font-bold text-slate-800">{b.timing}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <Layers className="w-3.5 h-3.5" /> Lab Room:
                                            </span>
                                            <span className="font-semibold text-slate-800">{b.classroom || "Main Lab"}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-500">Instructor:</span>
                                            <span className="font-semibold text-slate-800">{b.facultyName}</span>
                                        </div>
                                    </div>

                                    {/* Capacity Progress Bar */}
                                    <div className="pt-3 border-t border-slate-100 space-y-1">
                                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                            <span>Enrollment Capacity</span>
                                            <span className="text-blue-700 font-bold">
                                                {b.currentEnrollment || 0} / {b.maxStudents || 30} ({enrollmentPct}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                style={{ width: `${Math.min(enrollmentPct, 100)}%` }}
                                                className={`h-full ${
                                                    enrollmentPct > 85 ? "bg-amber-500" : "bg-blue-600"
                                                } rounded-full transition-all duration-300`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                    <button
                                        onClick={() => handleViewStudents(b._id, b.name)}
                                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Users className="w-3.5 h-3.5" /> View Students
                                    </button>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleOpenEdit(b)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                            title="Edit Batch"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b._id, b.name)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                            title="Delete Batch"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                    <p className="font-semibold text-slate-700">No active batches created yet.</p>
                </div>
            )}

            {/* Create / Edit Batch Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingBatch ? "Edit Batch" : "Create New Batch"}
                subtitle="Configure batch timing, course curriculum, and lab capacity"
                size="md"
                footer={
                    <>
                        <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" onClick={handleSubmit} loading={isSaving}>
                            {editingBatch ? "Save Updates" : "Create Batch"}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                    <Input
                        label="Batch Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Morning Alpha Batch"
                        required
                    />

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            Associated Course
                        </label>
                        <select
                            value={formData.courseName}
                            onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                        >
                            {courses.map((c) => (
                                <option key={c.code} value={c.title}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Class Timing"
                            value={formData.timing}
                            onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                            placeholder="08:00 AM - 10:00 AM"
                            required
                        />
                        <Input
                            label="Lab Room / Classroom"
                            value={formData.classroom}
                            onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                            placeholder="Lab 1"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Assigned Instructor
                            </label>
                            <select
                                value={formData.facultyName}
                                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                            >
                                <option value="To Be Assigned">-- Select Faculty --</option>
                                {facultyList.map((f) => (
                                    <option key={f._id} value={f.fullName}>
                                        {f.fullName} ({f.specialization || "Faculty"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Max Student Capacity"
                            type="number"
                            value={formData.maxStudents}
                            onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                        />
                    </div>
                </form>
            </Modal>

            {/* View Batch Students Modal */}
            <Modal
                isOpen={studentsModalOpen}
                onClose={() => setStudentsModalOpen(false)}
                title={`Students in ${selectedBatchName}`}
                subtitle={`Currently enrolled: ${activeBatchStudents.length} students`}
                size="md"
            >
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                    {activeBatchStudents.length > 0 ? (
                        activeBatchStudents.map((s) => (
                            <div key={s._id} className="py-2.5 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900">{s.fullName}</p>
                                    <p className="text-slate-400 font-mono text-[11px]">{s.studentId || s.email}</p>
                                </div>
                                <Badge variant={s.feeStatus === "paid" ? "success" : "warning"} size="sm">
                                    {s.feeStatus?.toUpperCase()}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="p-6 text-center text-slate-400">No students assigned to this batch yet.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default BatchList;
