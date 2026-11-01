import React, { useState, useEffect } from "react";
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    Download,
    Users,
    Layers,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { attendanceAPI, batchAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import toast from "react-hot-toast";

export const Attendance = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

    const [attendanceData, setAttendanceData] = useState(null);
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);

    // Initial batch list
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await batchAPI.getAll();
                if (res?.batches && res.batches.length > 0) {
                    setBatches(res.batches);
                    setSelectedBatchId(res.batches[0]._id);
                }
            } catch {
                toast.error("Failed to load batches");
            }
        };
        fetchBatches();
    }, []);

    // Load attendance roster whenever batch or date changes
    const loadAttendance = async () => {
        if (!selectedBatchId || !selectedDate) return;
        setIsLoading(true);
        try {
            const res = await attendanceAPI.getBatch(selectedBatchId, selectedDate);
            if (res?.success) {
                setAttendanceData(res.attendance);
                setRecords(res.attendance.records || []);
                setIsAlreadyMarked(res.isMarked);
            }
        } catch (err) {
            toast.error(err.message || "Failed to load attendance roster");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, [selectedBatchId, selectedDate]);

    // Handle single student status toggle
    const handleStatusChange = (index, status) => {
        setRecords((prev) =>
            prev.map((r, i) => (i === index ? { ...r, status } : r))
        );
    };

    const handleRemarksChange = (index, remarks) => {
        setRecords((prev) =>
            prev.map((r, i) => (i === index ? { ...r, remarks } : r))
        );
    };

    // Mark all Present
    const markAllPresent = () => {
        setRecords((prev) => prev.map((r) => ({ ...r, status: "present" })));
    };

    // Save attendance
    const handleSave = async () => {
        if (records.length === 0) {
            toast.error("No student records available to mark attendance");
            return;
        }

        setIsSaving(true);
        try {
            const res = await attendanceAPI.save({
                batchId: selectedBatchId,
                date: selectedDate,
                records,
            });
            if (res?.success) {
                toast.success(res.msg);
                setIsAlreadyMarked(true);
            }
        } catch (err) {
            toast.error(err.message || "Failed to save attendance");
        } finally {
            setIsSaving(false);
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        if (records.length === 0) return;
        const headers = ["Student Code", "Student Name", "Date", "Status", "Remarks"];
        const rows = records.map((r) => [
            r.studentCode,
            `"${r.studentName}"`,
            selectedDate,
            r.status?.toUpperCase(),
            `"${r.remarks || ""}"`,
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Attendance sheet exported to CSV");
    };

    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const lateCount = records.filter((r) => r.status === "late").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Register</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daily laboratory session attendance, biometric validation & punctuality records
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
                        Export Daily Sheet
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        loading={isSaving}
                        icon={Save}
                    >
                        Save Attendance
                    </Button>
                </div>
            </div>

            {/* Batch & Date Selector Card */}
            <Card className="p-5 border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                            Select Lab Batch
                        </label>
                        <select
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        >
                            {batches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.name} ({b.timing})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                            Attendance Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                        <Button variant="outline" size="md" className="w-full" onClick={markAllPresent}>
                            Mark All Present
                        </Button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        {isAlreadyMarked ? (
                            <Badge variant="success" size="sm">
                                ✓ Marked & Saved on Record
                            </Badge>
                        ) : (
                            <Badge variant="warning" size="sm">
                                Pending Submission for {selectedDate}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-4 font-semibold">
                        <span className="text-emerald-700">Present: {presentCount}</span>
                        <span className="text-red-700">Absent: {absentCount}</span>
                        <span className="text-amber-700">Late: {lateCount}</span>
                        <span className="text-slate-900 font-bold">Total: {records.length}</span>
                    </div>
                </div>
            </Card>

            {/* Attendance Student Roster Table */}
            <Card className="p-0 overflow-hidden border-slate-200 shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                                <th className="p-4 w-12 text-center">#</th>
                                <th className="p-4">Student ID</th>
                                <th className="p-4">Student Name</th>
                                <th className="p-4 text-center">Status (Select)</th>
                                <th className="p-4">Remarks / Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-500">
                                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                                        Loading attendance roster...
                                    </td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.map((r, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="p-4 font-mono font-bold text-blue-600">{r.studentCode || "-"}</td>
                                        <td className="p-4 font-bold text-slate-900">{r.studentName}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(idx, "present")}
                                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                                        r.status === "present"
                                                            ? "bg-emerald-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    Present
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(idx, "absent")}
                                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                                        r.status === "absent"
                                                            ? "bg-red-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    Absent
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(idx, "late")}
                                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                                        r.status === "late"
                                                            ? "bg-amber-500 text-slate-950 shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    Late
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                placeholder="e.g. excused leave, medical, lab terminal issue"
                                                value={r.remarks || ""}
                                                onChange={(e) => handleRemarksChange(idx, e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-500">
                                        No students found in this batch. Please enroll students or select another batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Attendance;
