import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Search,
    Filter,
    Plus,
    Download,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Key,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    UserX,
    UserCheck,
    AlertCircle,
    FileSpreadsheet,
} from "lucide-react";
import { studentAPI, courseAPI, batchAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

// Sub-components
import AddStudent from "./AddStudent";
import StudentDetails from "./StudentDetails";

export const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [batchFilter, setBatchFilter] = useState("all");
    const [feeStatusFilter, setFeeStatusFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");

    // Dynamic dropdown options
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    // Selection & Bulk
    const [selectedIds, setSelectedIds] = useState([]);

    // Modals
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [editStudentData, setEditStudentData] = useState(null);
    const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
    const [resetTargetStudent, setResetTargetStudent] = useState(null);
    const [tempPassword, setTempPassword] = useState("Student@123");

    // Fetch Students with current filters & pagination
    const fetchStudents = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                sortBy,
                order,
            };
            if (search.trim()) params.search = search.trim();
            if (courseFilter !== "all") params.course = courseFilter;
            if (batchFilter !== "all") params.batch = batchFilter;
            if (feeStatusFilter !== "all") params.feeStatus = feeStatusFilter;
            if (statusFilter !== "all") params.status = statusFilter;

            const res = await studentAPI.getAll(params);
            if (res?.success) {
                setStudents(res.students || []);
                setPagination(res.pagination || { total: 0, page: 1, pages: 1, limit: 10 });
            }
        } catch (err) {
            toast.error(err.message || "Failed to load students");
        } finally {
            setIsLoading(false);
        }
    }, [search, courseFilter, batchFilter, feeStatusFilter, statusFilter, sortBy, order, pagination.limit]);

    // Initial Dropdown Options
    useEffect(() => {
        const fetchFiltersData = async () => {
            try {
                const [coursesRes, batchesRes] = await Promise.all([
                    courseAPI.getAll(),
                    batchAPI.getAll(),
                ]);
                if (coursesRes?.courses) setCourses(coursesRes.courses);
                if (batchesRes?.batches) setBatches(batchesRes.batches);
            } catch {
                // Ignore
            }
        };
        fetchFiltersData();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchStudents(1);
        }, 300);
        return () => clearTimeout(timeout);
    }, [search, courseFilter, batchFilter, feeStatusFilter, statusFilter, sortBy, order]);

    // Handle Select All Checkbox
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(students.map((s) => s._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Toggle Active / Inactive Status
    const handleToggleStatus = async (id, name) => {
        try {
            const res = await studentAPI.toggleStatus(id);
            if (res?.success) {
                toast.success(res.msg);
                setStudents((prev) =>
                    prev.map((s) => (s._id === id ? { ...s, isActive: res.isActive } : s))
                );
            }
        } catch (err) {
            toast.error(err.message || "Status change failed");
        }
    };

    // Reset Password
    const handleResetPassword = async () => {
        if (!resetTargetStudent) return;
        try {
            const res = await studentAPI.resetPassword(resetTargetStudent._id, tempPassword);
            if (res?.success) {
                toast.success(res.msg);
                setResetPassModalOpen(false);
                setResetTargetStudent(null);
            }
        } catch (err) {
            toast.error(err.message || "Failed to reset password");
        }
    };

    // Delete Student
    const handleDeleteStudent = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete student ${name}? This cannot be undone.`)) {
            return;
        }
        try {
            const res = await studentAPI.delete(id);
            if (res?.success) {
                toast.success(res.msg);
                fetchStudents(pagination.page);
            }
        } catch (err) {
            toast.error(err.message || "Failed to delete student");
        }
    };

    // Bulk Status Updates
    const handleBulkStatus = async (isActive) => {
        if (selectedIds.length === 0) return;
        try {
            const res = await studentAPI.bulkStatus(selectedIds, isActive);
            if (res?.success) {
                toast.success(res.msg);
                setSelectedIds([]);
                fetchStudents(pagination.page);
            }
        } catch (err) {
            toast.error(err.message || "Bulk action failed");
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (students.length === 0) {
            toast.error("No student records to export");
            return;
        }

        const headers = ["Student ID", "Full Name", "Email", "Mobile", "Course", "Batch", "Admission Date", "Total Fee", "Paid", "Balance", "Fee Status", "Account Status"];
        const rows = students.map((s) => [
            s.studentId || "",
            `"${s.fullName || ""}"`,
            s.email || "",
            s.mobile || "",
            `"${s.course || ""}"`,
            `"${s.batchName || ""}"`,
            s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : "",
            s.totalFee || 0,
            s.paidAmount || 0,
            s.remainingBalance || 0,
            s.feeStatus || "pending",
            s.isActive ? "Active" : "Inactive",
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Balaji_Computer_Students_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Student records exported to CSV successfully");
    };

    const getFeeBadge = (status) => {
        switch (status) {
            case "paid":
                return <Badge variant="success" size="sm">Paid</Badge>;
            case "partial":
                return <Badge variant="warning" size="sm">Partial</Badge>;
            case "overdue":
                return <Badge variant="danger" size="sm">Overdue</Badge>;
            default:
                return <Badge variant="secondary" size="sm">Pending</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Total {pagination.total} students registered across all academic courses
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
                        Export CSV
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setAddModalOpen(true)}
                        icon={Plus}
                    >
                        New Admission
                    </Button>
                </div>
            </div>

            {/* Filters & Search Control Bar */}
            <Card className="p-4 sm:p-5 border-slate-200/80 shadow-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="lg:col-span-4 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Course Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                            <option value="all">All Courses</option>
                            {courses.map((c) => (
                                <option key={c.code} value={c.title}>
                                    {c.code} - {c.title.slice(0, 20)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Batch Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                            <option value="all">All Batches</option>
                            {batches.map((b) => (
                                <option key={b._id} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fee Status Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={feeStatusFilter}
                            onChange={(e) => setFeeStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                            <option value="all">Fee: All</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    {/* Account Status Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                            <option value="all">Status: All</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Actions Banner (appears when items are selected) */}
                {selectedIds.length > 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                        <span className="font-semibold text-blue-900">
                            {selectedIds.length} students selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatus(true)}
                                icon={UserCheck}
                            >
                                Activate Selected
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatus(false)}
                                icon={UserX}
                            >
                                Deactivate Selected
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Student Table */}
            <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={students.length > 0 && selectedIds.length === students.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Full Name</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Course & Batch</th>
                                <th className="p-4">Admission</th>
                                <th className="p-4">Fee Status</th>
                                <th className="p-4">Account</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="p-10 text-center text-slate-500">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                                        Loading student records...
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                students.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s._id)}
                                                onChange={() => handleSelectOne(s._id)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-900">
                                            {s.studentId || "BC-PENDING"}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                                                    {s.fullName ? s.fullName[0].toUpperCase() : "S"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{s.fullName}</p>
                                                    <span className="text-[11px] text-slate-500 capitalize">{s.gender || "Student"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 space-y-0.5">
                                            <p className="text-slate-800 font-medium">{s.mobile}</p>
                                            <p className="text-slate-400 text-[11px] truncate max-w-[150px]">{s.email}</p>
                                        </td>
                                        <td className="p-4 space-y-0.5">
                                            <p className="font-semibold text-blue-600">{s.course}</p>
                                            <p className="text-slate-500 text-[11px]">{s.batchName || "Unassigned"}</p>
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="p-4">{getFeeBadge(s.feeStatus)}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleStatus(s._id, s.fullName)}
                                                className="cursor-pointer"
                                                title="Click to toggle status"
                                            >
                                                <Badge variant={s.isActive ? "success" : "secondary"} size="sm">
                                                    {s.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudentId(s._id);
                                                        setDetailsModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                                    title="View Full Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setResetTargetStudent(s);
                                                        setResetPassModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(s._id, s.fullName)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="p-12 text-center text-slate-500 space-y-2">
                                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="font-semibold text-slate-700">No students found matching filters.</p>
                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setCourseFilter("all");
                                                setBatchFilter("all");
                                                setFeeStatusFilter("all");
                                                setStatusFilter("all");
                                            }}
                                            className="text-xs text-blue-600 hover:underline font-semibold"
                                        >
                                            Reset all filters
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                        Showing {students.length} of {pagination.total} students (Page {pagination.page} of {pagination.pages})
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => fetchStudents(pagination.page - 1)}
                            icon={ChevronLeft}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => fetchStudents(pagination.page + 1)}
                            icon={ChevronRight}
                            iconPosition="right"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Add Student Modal */}
            <AddStudent
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={() => {
                    setAddModalOpen(false);
                    fetchStudents(1);
                }}
                courses={courses}
                batches={batches}
            />

            {/* Student Full Details Modal */}
            <StudentDetails
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedStudentId(null);
                }}
                studentId={selectedStudentId}
                onUpdated={() => fetchStudents(pagination.page)}
            />

            {/* Password Reset Modal */}
            <Modal
                isOpen={resetPassModalOpen}
                onClose={() => setResetPassModalOpen(false)}
                title="Reset Student Password"
                subtitle={`Reset credentials for ${resetTargetStudent?.fullName} (${resetTargetStudent?.studentId})`}
                size="sm"
                footer={
                    <>
                        <Button variant="outline" size="md" onClick={() => setResetPassModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="md" onClick={handleResetPassword}>
                            Set New Password
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Enter a temporary password for this student. The student will be prompted to change it upon their next sign in.
                    </p>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                            New Temporary Password
                        </label>
                        <input
                            type="text"
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StudentList;
