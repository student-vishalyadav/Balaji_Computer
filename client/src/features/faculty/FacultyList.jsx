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
} from "lucide-react";
import { facultyAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
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
                toast.success(res.msg);
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
                assignedCourses: formData.assignedCourses.split(",").map((s) => s.trim()).filter(Boolean),
                assignedBatches: formData.assignedBatches.split(",").map((s) => s.trim()).filter(Boolean),
            };

            if (editingFaculty) {
                const res = await facultyAPI.update(editingFaculty._id, payload);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchFaculty();
                }
            } else {
                const res = await facultyAPI.create(payload);
                if (res?.success) {
                    toast.success(res.msg);
                    setModalOpen(false);
                    fetchFaculty();
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to save faculty");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Directory of expert lab instructors, accounting trainers, and programming mentors
                    </p>
                </div>
                {isAdmin && (
                    <Button variant="primary" size="sm" onClick={handleOpenAdd} icon={Plus}>
                        Add New Faculty
                    </Button>
                )}
            </div>

            {/* Search */}
            <Card className="p-4 border-slate-200">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search faculty by name, email, specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                </div>
            </Card>

            {/* Faculty Cards Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200" />
                    ))}
                </div>
            ) : faculty.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {faculty.map((f) => (
                        <Card key={f._id} hoverable={true} className="p-6 flex flex-col justify-between space-y-4 border-slate-200">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base shrink-0">
                                            {f.fullName ? f.fullName[0].toUpperCase() : "F"}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">{f.fullName}</h3>
                                            <p className="text-xs text-blue-600 font-semibold">{f.specialization || "Instructor"}</p>
                                        </div>
                                    </div>
                                    <Badge variant={f.isActive ? "success" : "secondary"} size="sm">
                                        {f.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100 mt-4">
                                    <p className="flex items-center gap-2">
                                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{f.qualification || "Qualified"} ({f.experience || "Experienced"})</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{f.email}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{f.mobile}</span>
                                    </p>
                                </div>

                                {f.assignedCourses && (
                                    <div className="pt-3 border-t border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                            Assigned Programs:
                                        </span>
                                        <p className="text-xs font-semibold text-slate-800 truncate">
                                            {Array.isArray(f.assignedCourses) ? f.assignedCourses.join(", ") : f.assignedCourses}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isAdmin && (
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEdit(f)}
                                        icon={Edit}
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
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                    <p className="font-semibold text-slate-700">No faculty members found.</p>
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
                    <>
                        <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="md" onClick={handleSubmit} loading={isSaving}>
                            {editingFaculty ? "Save Updates" : "Add Faculty"}
                        </Button>
                    </>
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
                </form>
            </Modal>
        </div>
    );
};

export default FacultyList;
