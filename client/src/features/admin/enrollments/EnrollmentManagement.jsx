import React, { useState, useEffect } from "react";
import {
    UserCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Calendar,
    Award,
    BookOpen,
    Layers,
    Eye,
    RefreshCw,
    AlertCircle,
    User,
    Phone,
    Mail,
    Send,
    Edit,
} from "lucide-react";
import { enrollmentAPI, batchAPI, facultyAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import toast from "react-hot-toast";

export const EnrollmentManagement = () => {
    const [requests, setRequests] = useState([]);
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [searchTerm, setSearchTerm] = useState("");

    // Batches & Faculty for approval dropdowns
    const [batches, setBatches] = useState([]);
    const [facultyList, setFacultyList] = useState([]);

    // Modals
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Approval Form Data
    const [approvalForm, setApprovalForm] = useState({
        batchId: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        timing: "09:00 AM - 11:00 AM",
        classDays: "Monday - Saturday",
        instructorName: "",
        duration: "6 Months",
    });
    const [isApproving, setIsApproving] = useState(false);

    // Rejection Form Data
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Fetch batches and faculty once
    useEffect(() => {
        const fetchAuxData = async () => {
            try {
                const [batchRes, facRes] = await Promise.all([
                    batchAPI.getAll(),
                    facultyAPI.getAll(),
                ]);
                if (batchRes?.batches) setBatches(batchRes.batches);
                if (facRes?.faculty) setFacultyList(facRes.faculty);
            } catch {
                // ignore
            }
        };
        fetchAuxData();
    }, []);

    // Fetch requests
    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await enrollmentAPI.getAll({
                status: statusFilter,
                search: searchTerm,
            });
            if (res?.success) {
                setRequests(res.requests || []);
                if (res.counts) setCounts(res.counts);
            }
        } catch (err) {
            toast.error("Failed to load enrollment requests.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchRequests();
        }, 250);
        return () => clearTimeout(timeout);
    }, [statusFilter, searchTerm]);

    // Open Approval Modal
    const handleOpenApprove = (req) => {
        setSelectedRequest(req);

        // Prepopulate based on batch if available
        const defaultBatch = batches[0];
        const defaultFaculty = facultyList[0];

        setApprovalForm({
            batchId: defaultBatch?._id || "",
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            timing: defaultBatch?.timing || "09:00 AM - 11:00 AM",
            classDays: "Monday - Saturday",
            instructorName: defaultFaculty?.fullName || defaultBatch?.facultyName || "Er. Dharmendra Pratap Singh",
            duration: req.courseId?.duration || "6 Months",
        });

        setApprovalModalOpen(true);
    };

    // When admin changes batch dropdown in approval modal, auto-populate timing & faculty
    const handleBatchChange = (bId) => {
        const b = batches.find((item) => item._id === bId);
        setApprovalForm((prev) => ({
            ...prev,
            batchId: bId,
            timing: b?.timing || prev.timing,
            instructorName: b?.facultyName !== "To Be Assigned" ? b?.facultyName || prev.instructorName : prev.instructorName,
        }));
    };

    // Execute Approval
    const handleSubmitApproval = async (e) => {
        e.preventDefault();
        if (!approvalForm.batchId) {
            toast.error("Please select a batch to assign to this student.");
            return;
        }

        setIsApproving(true);
        try {
            const res = await enrollmentAPI.approve(selectedRequest._id, approvalForm);
            if (res?.success) {
                toast.success(res.msg || "Enrollment approved and course assigned successfully!");
                setApprovalModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || err.message || "Failed to approve enrollment.");
        } finally {
            setIsApproving(false);
        }
    };

    // Open Rejection Modal
    const handleOpenReject = (req) => {
        setSelectedRequest(req);
        setRejectionReason("");
        setRejectionModalOpen(true);
    };

    // Execute Rejection
    const handleSubmitRejection = async (e) => {
        e.preventDefault();
        if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
            toast.error("Please enter a mandatory rejection reason (min 3 characters).");
            return;
        }

        setIsRejecting(true);
        try {
            const res = await enrollmentAPI.reject(selectedRequest._id, {
                rejectionReason: rejectionReason.trim(),
            });
            if (res?.success) {
                toast.success("Enrollment request has been rejected.");
                setRejectionModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || err.message || "Failed to reject enrollment.");
        } finally {
            setIsRejecting(false);
        }
    };

    // View Details
    const handleViewDetails = (req) => {
        setSelectedRequest(req);
        setDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                        Enrollment Requests & Course Assignment
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Review student applications, assign batches, class schedules, and certified lab instructors
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchRequests}
                        icon={RefreshCw}
                        className={isLoading ? "animate-spin text-blue-600" : ""}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card
                    onClick={() => setStatusFilter("ALL")}
                    className={`p-4 cursor-pointer transition-all ${
                        statusFilter === "ALL" ? "ring-2 ring-blue-600 bg-blue-50/40" : "hover:border-blue-200"
                    }`}
                >
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Requests
                    </span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{counts.total}</p>
                </Card>

                <Card
                    onClick={() => setStatusFilter("PENDING")}
                    className={`p-4 cursor-pointer transition-all ${
                        statusFilter === "PENDING" ? "ring-2 ring-amber-500 bg-amber-50/40" : "hover:border-amber-200"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                            Pending Review
                        </span>
                        {counts.pending > 0 && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                        )}
                    </div>
                    <p className="text-2xl font-black text-amber-700 mt-1">{counts.pending}</p>
                </Card>

                <Card
                    onClick={() => setStatusFilter("APPROVED")}
                    className={`p-4 cursor-pointer transition-all ${
                        statusFilter === "APPROVED" ? "ring-2 ring-emerald-500 bg-emerald-50/40" : "hover:border-emerald-200"
                    }`}
                >
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                        Approved & Active
                    </span>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{counts.approved}</p>
                </Card>

                <Card
                    onClick={() => setStatusFilter("REJECTED")}
                    className={`p-4 cursor-pointer transition-all ${
                        statusFilter === "REJECTED" ? "ring-2 ring-red-500 bg-red-50/40" : "hover:border-red-200"
                    }`}
                >
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
                        Rejected Applications
                    </span>
                    <p className="text-2xl font-black text-red-700 mt-1">{counts.rejected}</p>
                </Card>
            </div>

            {/* Filter Tabs & Search Bar */}
            <Card padding="p-3 sm:p-4" className="border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        {[
                            { key: "ALL", label: "All Requests", count: counts.total },
                            { key: "PENDING", label: "Pending", count: counts.pending },
                            { key: "APPROVED", label: "Approved", count: counts.approved },
                            { key: "REJECTED", label: "Rejected", count: counts.rejected },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                    statusFilter === tab.key
                                        ? "bg-slate-900 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        statusFilter === tab.key ? "bg-white/20 text-white" : "bg-white text-slate-700"
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[260px] flex-1 md:max-w-xs">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by student, email, ID, or course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                    </div>
                </div>
            </Card>

            {/* Enrollment Requests Table */}
            <Card padding="p-0" className="border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <th className="py-3.5 px-4 sm:px-6">Student Applicant</th>
                                <th className="py-3.5 px-3">Student ID</th>
                                <th className="py-3.5 px-3">Contact</th>
                                <th className="py-3.5 px-4">Requested Course</th>
                                <th className="py-3.5 px-3">Request Date</th>
                                <th className="py-3.5 px-3">Status</th>
                                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                        Loading enrollment applications...
                                    </td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                                        {/* Student Name */}
                                        <td className="py-3.5 px-4 sm:px-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {req.studentName ? req.studentName[0].toUpperCase() : "S"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                                                        {req.studentName}
                                                    </p>
                                                    <span className="text-[11px] text-slate-400 truncate block">
                                                        {req.studentEmail}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Student ID */}
                                        <td className="py-3.5 px-3 font-mono font-semibold text-blue-600 text-xs">
                                            {req.studentCode || req.studentId?.studentId || "PENDING"}
                                        </td>

                                        {/* Phone */}
                                        <td className="py-3.5 px-3 text-slate-600 text-xs">
                                            {req.studentMobile || "—"}
                                        </td>

                                        {/* Requested Course */}
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-slate-900 block truncate max-w-[180px]">
                                                {req.courseTitle}
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-400">
                                                {req.courseCode} • ₹{req.courseFee?.toLocaleString("en-IN")}
                                            </span>
                                        </td>

                                        {/* Request Date */}
                                        <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-nowrap">
                                            {req.requestDate
                                                ? new Date(req.requestDate).toLocaleDateString("en-IN", {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                  })
                                                : "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-3">
                                            <Badge
                                                variant={
                                                    req.status === "APPROVED"
                                                        ? "success"
                                                        : req.status === "REJECTED"
                                                        ? "danger"
                                                        : req.status === "PENDING"
                                                        ? "warning"
                                                        : "secondary"
                                                }
                                                size="sm"
                                            >
                                                {req.status}
                                            </Badge>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {req.status === "PENDING" && (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            size="xs"
                                                            onClick={() => handleOpenApprove(req)}
                                                            icon={CheckCircle2}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="xs"
                                                            onClick={() => handleOpenReject(req)}
                                                            icon={XCircle}
                                                            className="text-red-600 hover:bg-red-50 border-red-200"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => handleViewDetails(req)}
                                                    icon={Eye}
                                                    title="View Full Application"
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                        <p className="font-semibold text-slate-700">No enrollment requests found</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {statusFilter !== "ALL"
                                                ? `No requests match filter: "${statusFilter}".`
                                                : "No student enrollment applications submitted yet."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Approval & Course Assignment Modal */}
            <Modal
                isOpen={approvalModalOpen}
                onClose={() => setApprovalModalOpen(false)}
                title="Approve Enrollment & Assign Course"
                subtitle={`Assign batch, class schedule, and mentor for ${selectedRequest?.studentName}`}
                size="lg"
                footer={
                    <>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setApprovalModalOpen(false)}
                            disabled={isApproving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSubmitApproval}
                            loading={isApproving}
                            icon={CheckCircle2}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Confirm Approval & Assign
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmitApproval} className="space-y-4 text-xs sm:text-sm">
                    {/* Student & Course Summary Banner */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Student Applicant
                            </span>
                            <p className="font-bold text-slate-900 text-sm">{selectedRequest?.studentName}</p>
                            <span className="text-xs text-slate-500">{selectedRequest?.studentEmail} • {selectedRequest?.studentMobile}</span>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Requested Curriculum
                            </span>
                            <p className="font-bold text-blue-700 text-sm">{selectedRequest?.courseTitle}</p>
                            <span className="text-xs text-slate-500">Code: {selectedRequest?.courseCode}</span>
                        </div>
                    </div>

                    {selectedRequest?.notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                            <span className="font-bold block mb-0.5">Student Application Remarks:</span>
                            <span>{selectedRequest.notes}</span>
                        </div>
                    )}

                    {/* Configuration Form Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Batch Assignment */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Assign Practical Lab Batch <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={approvalForm.batchId}
                                onChange={(e) => handleBatchChange(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            >
                                <option value="">-- Select Lab Batch --</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name} ({b.timing} • Lab: {b.classroom || "Main"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Instructor Assignment */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Assign Certified Lab Instructor <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={approvalForm.instructorName}
                                onChange={(e) => setApprovalForm({ ...approvalForm, instructorName: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                required
                            >
                                <option value="">-- Select Instructor --</option>
                                {facultyList.map((f) => (
                                    <option key={f._id} value={f.fullName}>
                                        {f.fullName} ({f.specialization || "Instructor"})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class Timing */}
                        <div>
                            <Input
                                label="Daily Class Timing"
                                value={approvalForm.timing}
                                onChange={(e) => setApprovalForm({ ...approvalForm, timing: e.target.value })}
                                placeholder="e.g. 09:00 AM - 11:00 AM"
                                required
                            />
                        </div>

                        {/* Class Days */}
                        <div>
                            <Input
                                label="Scheduled Class Days"
                                value={approvalForm.classDays}
                                onChange={(e) => setApprovalForm({ ...approvalForm, classDays: e.target.value })}
                                placeholder="e.g. Monday - Saturday"
                                required
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <Input
                                label="Course Start Date"
                                type="date"
                                value={approvalForm.startDate}
                                onChange={(e) => setApprovalForm({ ...approvalForm, startDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <Input
                                label="Expected Completion Date"
                                type="date"
                                value={approvalForm.endDate}
                                onChange={(e) => setApprovalForm({ ...approvalForm, endDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* Duration */}
                        <div className="sm:col-span-2">
                            <Input
                                label="Course Duration"
                                value={approvalForm.duration}
                                onChange={(e) => setApprovalForm({ ...approvalForm, duration: e.target.value })}
                                placeholder="e.g. 6 Months (FastTrack) or 1 Year"
                                required
                            />
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Rejection Modal with Mandatory Reason */}
            <Modal
                isOpen={rejectionModalOpen}
                onClose={() => setRejectionModalOpen(false)}
                title="Reject Enrollment Application"
                subtitle={`Specify administrative rejection reason for ${selectedRequest?.studentName}`}
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setRejectionModalOpen(false)}
                            disabled={isRejecting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSubmitRejection}
                            loading={isRejecting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Confirm Rejection
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmitRejection} className="space-y-4 text-xs sm:text-sm">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                        <span className="font-bold block mb-0.5">Action Notice</span>
                        The student will receive an instant rejection notification explaining this reason on their dashboard.
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mandatory Administrative Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Batch capacity full for current session, prerequisite qualification missing, or fee verification pending."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600"
                            required
                        />
                    </div>
                </form>
            </Modal>

            {/* View Full Application Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                title="Enrollment Application Details"
                subtitle={`Reference ID: ${selectedRequest?._id}`}
                size="md"
                footer={
                    <Button variant="outline" size="md" onClick={() => setDetailsModalOpen(false)}>
                        Close Details
                    </Button>
                }
            >
                <div className="space-y-4 text-xs sm:text-sm">
                    {/* Status Ribbon */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-semibold text-slate-500">Application Status:</span>
                        <Badge
                            variant={
                                selectedRequest?.status === "APPROVED"
                                    ? "success"
                                    : selectedRequest?.status === "REJECTED"
                                    ? "danger"
                                    : "warning"
                            }
                            size="md"
                        >
                            {selectedRequest?.status}
                        </Badge>
                    </div>

                    {/* Student Info */}
                    <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Student Credentials
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-slate-400 block">Name:</span>
                                <span className="font-semibold text-slate-800">{selectedRequest?.studentName}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Student Code:</span>
                                <span className="font-mono font-bold text-blue-600">{selectedRequest?.studentCode || "—"}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Email:</span>
                                <span className="font-medium text-slate-800 truncate block">{selectedRequest?.studentEmail}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Phone:</span>
                                <span className="font-medium text-slate-800">{selectedRequest?.studentMobile || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-3.5 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Course Details
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-slate-400 block">Title:</span>
                                <span className="font-bold text-slate-800">{selectedRequest?.courseTitle}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Code:</span>
                                <span className="font-mono text-slate-800">{selectedRequest?.courseCode}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Total Fee:</span>
                                <span className="font-bold text-slate-900">₹{selectedRequest?.courseFee?.toLocaleString("en-IN")}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block">Submission Date:</span>
                                <span className="text-slate-700">
                                    {selectedRequest?.requestDate
                                        ? new Date(selectedRequest.requestDate).toLocaleString("en-IN")
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* If rejection reason exists */}
                    {selectedRequest?.rejectionReason && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                            <span className="font-bold block mb-0.5">Administrative Rejection Reason:</span>
                            <span>{selectedRequest.rejectionReason}</span>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default EnrollmentManagement;
