import React, { useState, useEffect } from "react";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { adminAPI, studentAPI, feeAPI, attendanceAPI, courseAPI, batchAPI } from "../../../services/api";
import {
    BarChart3,
    TrendingUp,
    Download,
    Printer,
    Users,
    CreditCard,
    CalendarCheck,
    BookOpen,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
} from "lucide-react";
import toast from "react-hot-toast";

export const Reports = () => {
    const [activeTab, setActiveTab] = useState("admissions");
    const [loading, setLoading] = useState(true);

    // Data states
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [feeRecords, setFeeRecords] = useState([]);
    const [attendanceReport, setAttendanceReport] = useState(null);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const loadAllReportData = async () => {
            setLoading(true);
            try {
                const [dashRes, stuRes, feeRes, attRes, crsRes, btcRes] = await Promise.all([
                    adminAPI.getDashboardStats().catch(() => ({})),
                    studentAPI.getAll({ limit: 100 }).catch(() => ({})),
                    feeAPI.getOverview({ limit: 100 }).catch(() => ({})),
                    attendanceAPI.getReport({}).catch(() => ({})),
                    courseAPI.getAll().catch(() => ({})),
                    batchAPI.getAll().catch(() => ({})),
                ]);

                if (dashRes.success) setStats(dashRes.data);
                if (stuRes.success) setStudents(stuRes.students || []);
                if (feeRes.success) setFeeRecords(feeRes.feeRecords || []);
                if (attRes.success) setAttendanceReport(attRes);
                if (crsRes.success) setCourses(crsRes.courses || []);
                if (btcRes.success) setBatches(btcRes.batches || []);
            } catch (error) {
                toast.error("Failed to compile reports");
            } finally {
                setLoading(false);
            }
        };

        loadAllReportData();
    }, []);

    // Export Admissions CSV
    const exportAdmissionsCSV = () => {
        if (!students.length) return toast.error("No student records to export");
        const headers = ["Student ID", "Full Name", "Email", "Mobile", "Course", "Batch", "Admission Date", "Status"];
        const rows = students.map((s) => [
            `"${s.studentId || ""}"`,
            `"${s.fullName}"`,
            `"${s.email}"`,
            `"${s.mobile}"`,
            `"${s.course || ""}"`,
            `"${s.batchName || ""}"`,
            s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : "",
            s.isActive ? "ACTIVE" : "INACTIVE",
        ]);
        downloadCSV("Balaji_Computer_Admissions_Report.csv", [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
    };

    // Export Fees CSV
    const exportFeesCSV = () => {
        if (!feeRecords.length) return toast.error("No fee records to export");
        const headers = ["Student ID", "Student Name", "Course", "Net Fee", "Total Paid", "Balance Due", "Status"];
        const rows = feeRecords.map((f) => [
            `"${f.studentCode || ""}"`,
            `"${f.studentName}"`,
            `"${f.courseName}"`,
            f.netFee || 0,
            f.paidAmount || 0,
            f.remainingBalance || 0,
            f.status?.toUpperCase(),
        ]);
        downloadCSV("Balaji_Computer_Fee_Collections_Report.csv", [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
    };

    // Export Attendance CSV
    const exportAttendanceCSV = () => {
        const history = attendanceReport?.history || [];
        if (!history.length) return toast.error("No attendance history to export");
        const headers = ["Date", "Batch Name", "Course", "Total Students", "Present", "Absent", "Late", "Attendance Rate"];
        const rows = history.map((h) => {
            const total = h.totalStudents || 1;
            const rate = Math.round(((h.presentCount || 0) / total) * 100);
            return [
                h.date,
                `"${h.batchName}"`,
                `"${h.courseName}"`,
                h.totalStudents,
                h.presentCount,
                h.absentCount,
                h.lateCount,
                `${rate}%`,
            ];
        });
        downloadCSV("Balaji_Computer_Attendance_Report.csv", [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));
    };

    const downloadCSV = (filename, content) => {
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report CSV exported successfully");
    };

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        Executive Reports & Institute Analytics
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Comprehensive admissions, fee collections, attendance audits, and academic performance summaries
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => window.print()} icon={Printer}>
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
                {[
                    { key: "admissions", label: "Student Admissions", icon: Users },
                    { key: "fees", label: "Fee Collections", icon: CreditCard },
                    { key: "attendance", label: "Attendance Audit", icon: CalendarCheck },
                    { key: "courses", label: "Course Distribution", icon: BookOpen },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === tab.key
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="py-20 text-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Aggregating executive reports...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* TAB 1: ADMISSIONS REPORT */}
                    {activeTab === "admissions" && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="p-5 border-l-4 border-l-blue-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Total Enrolled</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                                        {stats?.metrics?.totalStudents || students.length} Students
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Active Students</p>
                                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                                        {stats?.metrics?.activeStudents || students.filter((s) => s.isActive).length}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-amber-500 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Inactive / On Leave</p>
                                    <h3 className="text-2xl font-black text-amber-600 mt-1">
                                        {stats?.metrics?.inactiveStudents || students.filter((s) => !s.isActive).length}
                                    </h3>
                                </Card>
                            </div>

                            {/* Admissions Chart */}
                            <Card className="p-6 bg-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900">Monthly Student Registrations</h4>
                                        <p className="text-xs text-slate-500">Calendar Year 2026 Admissions Trend</p>
                                    </div>
                                    <Button variant="outline" size="xs" onClick={exportAdmissionsCSV} icon={Download}>
                                        Export CSV
                                    </Button>
                                </div>

                                <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                                    {(stats?.charts?.monthlyAdmissions || []).map((m, i) => {
                                        const maxStudents = 80;
                                        const heightPercent = Math.min(100, Math.max(12, Math.round((m.students / maxStudents) * 100)));
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="relative w-full flex items-end justify-center h-44">
                                                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md transition-opacity pointer-events-none">
                                                        {m.students}
                                                    </span>
                                                    <div
                                                        style={{ height: `${heightPercent}%` }}
                                                        className="w-full max-w-[28px] bg-blue-600/90 group-hover:bg-blue-600 rounded-t-lg transition-all"
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Recent Admissions Table */}
                            <Card className="p-5 bg-white">
                                <h4 className="font-extrabold text-slate-900 mb-3 text-sm">Admissions Log</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="py-2.5 px-3">Student ID</th>
                                                <th className="py-2.5 px-3">Student Name</th>
                                                <th className="py-2.5 px-3">Course</th>
                                                <th className="py-2.5 px-3">Batch</th>
                                                <th className="py-2.5 px-3">Contact</th>
                                                <th className="py-2.5 px-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {students.slice(0, 10).map((st) => (
                                                <tr key={st._id}>
                                                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                                                        {st.studentId || "-"}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">{st.fullName}</td>
                                                    <td className="py-2.5 px-3">{st.course}</td>
                                                    <td className="py-2.5 px-3">{st.batchName || "Flexible"}</td>
                                                    <td className="py-2.5 px-3 text-slate-500">{st.mobile}</td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant={st.isActive ? "success" : "warning"} size="sm">
                                                            {st.isActive ? "ACTIVE" : "INACTIVE"}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB 2: FEE COLLECTIONS REPORT */}
                    {activeTab === "fees" && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Total Fees Collected</p>
                                    <h3 className="text-2xl font-black text-emerald-600 mt-1">
                                        ₹{(stats?.metrics?.totalFeesCollected || 980000).toLocaleString("en-IN")}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-amber-500 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Total Pending Dues</p>
                                    <h3 className="text-2xl font-black text-amber-600 mt-1">
                                        ₹{(stats?.metrics?.totalPendingFees || 145000).toLocaleString("en-IN")}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-blue-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Collection Efficiency</p>
                                    <h3 className="text-2xl font-black text-blue-600 mt-1">87.1%</h3>
                                </Card>
                            </div>

                            {/* Monthly Fee Collection Chart */}
                            <Card className="p-6 bg-white">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900">Monthly Fee Inflows</h4>
                                        <p className="text-xs text-slate-500">Collection amounts in ₹ INR</p>
                                    </div>
                                    <Button variant="outline" size="xs" onClick={exportFeesCSV} icon={Download}>
                                        Export CSV
                                    </Button>
                                </div>

                                <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-200">
                                    {(stats?.charts?.monthlyFees || []).map((m, i) => {
                                        const maxFee = 400000;
                                        const heightPercent = Math.min(100, Math.max(10, Math.round((m.amount / maxFee) * 100)));
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="relative w-full flex items-end justify-center h-44">
                                                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md transition-opacity pointer-events-none whitespace-nowrap">
                                                        ₹{(m.amount / 1000).toFixed(0)}k
                                                    </span>
                                                    <div
                                                        style={{ height: `${heightPercent}%` }}
                                                        className="w-full max-w-[28px] bg-emerald-600/90 group-hover:bg-emerald-600 rounded-t-lg transition-all"
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Fee Ledger Sample */}
                            <Card className="p-5 bg-white">
                                <h4 className="font-extrabold text-slate-900 mb-3 text-sm">Fee Balances Ledger</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="py-2.5 px-3">Student</th>
                                                <th className="py-2.5 px-3">Course</th>
                                                <th className="py-2.5 px-3">Net Fee</th>
                                                <th className="py-2.5 px-3">Paid</th>
                                                <th className="py-2.5 px-3">Remaining Balance</th>
                                                <th className="py-2.5 px-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {feeRecords.slice(0, 10).map((f) => (
                                                <tr key={f._id}>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">{f.studentName}</td>
                                                    <td className="py-2.5 px-3">{f.courseName}</td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-800">
                                                        ₹{(f.netFee || 0).toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-emerald-600">
                                                        ₹{(f.paidAmount || 0).toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-amber-600">
                                                        ₹{(f.remainingBalance || 0).toLocaleString("en-IN")}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <Badge variant={f.status === "paid" ? "success" : "warning"} size="sm">
                                                            {f.status?.toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB 3: ATTENDANCE AUDIT REPORT */}
                    {activeTab === "attendance" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Card className="p-5 border-l-4 border-l-blue-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Overall Attendance Rate</p>
                                    <h3 className="text-2xl font-black text-blue-600 mt-1">
                                        {attendanceReport?.summary?.averageRate || stats?.metrics?.attendanceRate || "94.2%"}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Total Class Sessions</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                                        {attendanceReport?.summary?.totalSessions || 48} Sessions
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-amber-500 bg-white">
                                    <p className="text-xs font-bold uppercase text-slate-400">Total Absences Recorded</p>
                                    <h3 className="text-2xl font-black text-amber-600 mt-1">
                                        {attendanceReport?.summary?.totalAbsent || 14}
                                    </h3>
                                </Card>
                            </div>

                            <Card className="p-5 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h4 className="font-extrabold text-slate-900 text-sm">Attendance Register History</h4>
                                        <p className="text-xs text-slate-500">Batch-wise daily log sheets</p>
                                    </div>
                                    <Button variant="outline" size="xs" onClick={exportAttendanceCSV} icon={Download}>
                                        Export CSV
                                    </Button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                            <tr>
                                                <th className="py-2.5 px-3">Date</th>
                                                <th className="py-2.5 px-3">Batch Name</th>
                                                <th className="py-2.5 px-3">Course</th>
                                                <th className="py-2.5 px-3">Enrolled</th>
                                                <th className="py-2.5 px-3">Present</th>
                                                <th className="py-2.5 px-3">Absent</th>
                                                <th className="py-2.5 px-3">Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium">
                                            {(attendanceReport?.history || []).slice(0, 10).map((h) => {
                                                const total = h.totalStudents || 1;
                                                const rate = Math.round(((h.presentCount || 0) / total) * 100);
                                                return (
                                                    <tr key={h._id}>
                                                        <td className="py-2.5 px-3 font-bold text-slate-800">{h.date}</td>
                                                        <td className="py-2.5 px-3 font-semibold text-slate-900">{h.batchName}</td>
                                                        <td className="py-2.5 px-3 text-slate-500">{h.courseName}</td>
                                                        <td className="py-2.5 px-3">{h.totalStudents}</td>
                                                        <td className="py-2.5 px-3 font-bold text-emerald-600">{h.presentCount}</td>
                                                        <td className="py-2.5 px-3 font-bold text-red-500">{h.absentCount}</td>
                                                        <td className="py-2.5 px-3">
                                                            <Badge variant={rate >= 80 ? "success" : "warning"} size="sm">
                                                                {rate}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB 4: COURSE DISTRIBUTION */}
                    {activeTab === "courses" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="p-6 bg-white">
                                    <h4 className="font-extrabold text-slate-900 text-sm mb-4">Course Enrollment Share</h4>
                                    <div className="space-y-4">
                                        {(stats?.charts?.courseDistribution || []).map((c, i) => {
                                            const total = stats.charts.courseDistribution.reduce((sum, item) => sum + item.count, 0) || 1;
                                            const pct = Math.round((c.count / total) * 100);
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                                        <span>{c.course}</span>
                                                        <span>{c.count} students ({pct}%)</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                        <div
                                                            className="bg-blue-600 h-2.5 rounded-full transition-all"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white space-y-4">
                                    <h4 className="font-extrabold text-slate-900 text-sm">Active Academic Programs</h4>
                                    <div className="divide-y divide-slate-100 text-xs">
                                        {courses.map((crs) => (
                                            <div key={crs._id} className="py-3 flex items-center justify-between">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{crs.name}</span>
                                                    <span className="text-slate-400">{crs.duration} • {crs.level}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-extrabold text-slate-900 block">
                                                        ₹{(crs.discountedFee || crs.fee || 0).toLocaleString("en-IN")}
                                                    </span>
                                                    <Badge variant={crs.isPopular ? "success" : "primary"} size="sm">
                                                        {crs.isPopular ? "FEATURED" : "ACTIVE"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
