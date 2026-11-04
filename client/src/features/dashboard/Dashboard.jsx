import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Clock,
    Award,
    Calendar,
    CheckCircle,
    CheckCircle2,
    XCircle,
    User,
    ArrowUpRight,
    Sparkles,
    RefreshCw,
    ShieldCheck,
    Layers,
    FileText,
    AlertCircle,
    Info,
    Phone,
    Mail,
    ChevronRight,
    GraduationCap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { studentDashboardAPI } from "../../services/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await studentDashboardAPI.getDashboard();
            if (res?.success) {
                setDashboardData(res);
            }
        } catch (err) {
            setError(err.response?.data?.msg || err.message || "Failed to load student dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
                <div className="h-44 bg-slate-200 rounded-3xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200" />
                    ))}
                </div>
                <div className="h-80 bg-white rounded-3xl border border-slate-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Dashboard Unavailable</h3>
                <p className="text-sm text-slate-500">{error}</p>
                <Button variant="primary" size="md" onClick={fetchDashboard} icon={RefreshCw}>
                    Retry
                </Button>
            </div>
        );
    }

    const hasApprovedCourse = dashboardData?.hasApprovedCourse;
    const profile = dashboardData?.profile || user;

    // ==========================================
    // STATE 1: PENDING APPROVAL / NO COURSE VIEW
    // ==========================================
    if (!hasApprovedCourse) {
        const pendingRequest = dashboardData?.pendingRequests?.[0];
        const latestRequest = dashboardData?.latestRequest;
        const isRejected = latestRequest?.status === "REJECTED";

        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="relative z-10 space-y-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-blue-100">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Balaji Computer Student Portal
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome, {profile?.fullName || profile?.username}!
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm">
                            Student ID: <span className="font-mono font-bold text-white">{profile?.studentId || "Pending Verification"}</span>
                        </p>
                    </div>
                </div>

                {/* Pending Approval Screen */}
                {pendingRequest ? (
                    <Card padding="p-6 sm:p-8" className="border-amber-200 bg-amber-50/30 space-y-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                        Enrollment Request Under Review
                                    </h2>
                                    <Badge variant="warning" size="sm">
                                        PENDING APPROVAL
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Your enrollment application for <strong>{pendingRequest.courseTitle}</strong> has
                                    been submitted to the Balaji Computer Institute administration.
                                </p>
                            </div>
                        </div>

                        {/* Request Details Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-amber-200/80 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Requested Course:</span>
                                <span className="font-bold text-slate-800 text-sm">{pendingRequest.courseTitle}</span>
                                <span className="text-[11px] text-slate-400 block font-mono">{pendingRequest.courseCode}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Submission Date:</span>
                                <span className="font-bold text-slate-800 text-sm">
                                    {new Date(pendingRequest.requestDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Approval Status:</span>
                                <span className="font-bold text-amber-600 text-sm flex items-center gap-1.5 mt-0.5">
                                    <Clock className="w-4 h-4 animate-spin text-amber-500" /> Awaiting Review
                                </span>
                            </div>
                        </div>

                        {/* Informative Guidance */}
                        <div className="p-4 bg-white/80 rounded-2xl border border-amber-100 space-y-2 text-xs text-slate-600">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                What happens next?
                            </span>
                            <ul className="list-disc pl-5 space-y-1 text-slate-600">
                                <li>An administrator reviews your applicant profile.</li>
                                <li>You are assigned a suitable practical computer lab batch and daily timing.</li>
                                <li>A certified faculty instructor/mentor is assigned to guide your coursework.</li>
                                <li>Once approved, your complete dynamic course dashboard and class schedule will activate automatically.</li>
                            </ul>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate-400">
                                Need expedited approval? Visit the institute reception or call +91 98765 43210.
                            </span>
                            <Button variant="outline" size="sm" onClick={fetchDashboard} icon={RefreshCw}>
                                Check Status
                            </Button>
                        </div>
                    </Card>
                ) : isRejected ? (
                    /* Rejected Screen with reason */
                    <Card padding="p-6 sm:p-8" className="border-red-200 bg-red-50/40 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                        Enrollment Request Rejected
                                    </h2>
                                    <Badge variant="danger" size="sm">
                                        REJECTED
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-600">
                                    Your enrollment application for <strong>{latestRequest.courseTitle}</strong> was
                                    not approved by the administration.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-red-200 space-y-1 text-xs">
                            <span className="font-bold text-red-700 uppercase tracking-wider text-[11px] block">
                                Reason Provided by Institute:
                            </span>
                            <p className="text-slate-800 font-medium text-sm leading-relaxed">
                                {latestRequest.rejectionReason || "Please contact the institute administration for further details."}
                            </p>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                            <Link to="/courses">
                                <Button variant="primary" size="md">
                                    Browse Available Courses & Re-Apply
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button variant="outline" size="md">
                                    Contact Institute Reception
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    /* No Request Submitted Yet Screen */
                    <Card padding="p-8" className="text-center space-y-6 border-slate-200">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="max-w-md mx-auto space-y-2">
                            <h2 className="text-xl font-bold text-slate-900">No Active Course Enrollment</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                You are not currently enrolled in any courses at Balaji Computer Institute.
                                Explore our certified course catalog and submit your enrollment request today.
                            </p>
                        </div>
                        <Link to="/courses">
                            <Button variant="primary" size="md" icon={ArrowUpRight} iconPosition="right">
                                Explore Professional Courses
                            </Button>
                        </Link>
                    </Card>
                )}
            </div>
        );
    }

    // ==========================================
    // STATE 2: ACTIVE APPROVED COURSE DASHBOARD
    // ==========================================
    const { activeCourse, schedule, attendance, progress } = dashboardData;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Top Welcome & Notification Ribbon */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Balaji Computer Institute • Active Student Portal
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Welcome, {profile?.fullName || profile?.username}!
                        </h1>
                        <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
                            Enrolled Program: <strong className="text-white">{activeCourse?.title}</strong> • Batch:{" "}
                            <strong className="text-white">{schedule?.batchName}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={fetchDashboard}
                            icon={RefreshCw}
                            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
                        >
                            Sync Records
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Active Course */}
                <Card className="p-5 flex items-center gap-4 border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Active Curriculum
                        </span>
                        <p className="text-sm sm:text-base font-bold text-slate-900 truncate" title={activeCourse?.title}>
                            {activeCourse?.code} • {activeCourse?.title}
                        </p>
                    </div>
                </Card>

                {/* Metric 2: Attendance Rate */}
                <Card className="p-5 flex items-center gap-4 border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Attendance Rate
                        </span>
                        <p className="text-xl font-black text-slate-900">
                            {attendance?.attendancePercentage}%
                        </p>
                    </div>
                </Card>

                {/* Metric 3: Lab Timing */}
                <Card className="p-5 flex items-center gap-4 border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Daily Lab Timing
                        </span>
                        <p className="text-sm font-bold text-slate-900 truncate" title={schedule?.timing}>
                            {schedule?.timing}
                        </p>
                    </div>
                </Card>

                {/* Metric 4: Progress */}
                <Card className="p-5 flex items-center gap-4 border-slate-200">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Curriculum Progress
                        </span>
                        <p className="text-xl font-black text-slate-900">
                            {progress?.progressPercentage}%
                        </p>
                    </div>
                </Card>
            </div>

            {/* Main Content 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns */}
                <div className="lg:col-span-2 space-y-8">
                    {/* SECTION B: ACTIVE COURSE CARD */}
                    <Card padding="p-6" className="border-slate-200 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                                    Official Enrolled Curriculum
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{activeCourse?.title}</h3>
                            </div>
                            <Badge variant="success" size="md">
                                {activeCourse?.status}
                            </Badge>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {activeCourse?.description}
                        </p>

                        {/* Course Spec Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                            <div>
                                <span className="text-slate-400 block font-medium">Program Code:</span>
                                <span className="font-mono font-bold text-slate-900">{activeCourse?.code}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Duration:</span>
                                <span className="font-bold text-slate-900">{activeCourse?.duration}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Commencement:</span>
                                <span className="font-medium text-slate-800">
                                    {activeCourse?.startDate ? new Date(activeCourse.startDate).toLocaleDateString("en-IN") : "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Completion Target:</span>
                                <span className="font-medium text-slate-800">
                                    {activeCourse?.endDate ? new Date(activeCourse.endDate).toLocaleDateString("en-IN") : "—"}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* SECTION C: COURSE SCHEDULE */}
                    <Card padding="p-6" className="border-slate-200 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Assigned Lab Schedule & Class Timings
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                Admin Assigned
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                                    Assigned Practical Batch
                                </span>
                                <p className="font-bold text-slate-900 text-base">{schedule?.batchName}</p>
                                <p className="text-xs text-slate-500">Location: {schedule?.classroom || "Computer Lab"}</p>
                            </div>

                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                                    Certified Faculty Instructor
                                </span>
                                <p className="font-bold text-slate-900 text-base">{schedule?.instructorName}</p>
                                <p className="text-xs text-slate-500">Technical Mentor & Lab Evaluator</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Daily Class Timing
                                </span>
                                <p className="font-bold text-slate-900">{schedule?.timing}</p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Scheduled Days
                                </span>
                                <p className="font-bold text-slate-900">{schedule?.classDays}</p>
                            </div>
                        </div>

                        {/* Next Class Information */}
                        {schedule?.nextClass && (
                            <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl flex items-center justify-between gap-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                                        Next Scheduled Lab Session
                                    </span>
                                    <p className="font-bold text-sm sm:text-base mt-0.5">{schedule.nextClass.topic}</p>
                                    <p className="text-xs text-slate-300">
                                        {schedule.timing} • {schedule.nextClass.classroom}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full shrink-0">
                                    {schedule.classDays}
                                </span>
                            </div>
                        )}
                    </Card>

                    {/* SECTION D: ATTENDANCE MANAGEMENT (READ-ONLY) */}
                    <Card padding="p-6" className="border-slate-200 space-y-5 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    Attendance Management Records
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Officially recorded by certified faculty instructors (Read-Only)
                                </p>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                                Formula: (Attended / Conducted) × 100
                            </span>
                        </div>

                        {/* Attendance Statistics Ribbons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                                <span className="text-[11px] font-semibold text-slate-400 block">Total Classes</span>
                                <p className="text-xl font-black text-slate-900 mt-0.5">{attendance?.totalClasses || 0}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                                <span className="text-[11px] font-semibold text-emerald-700 block">Attended</span>
                                <p className="text-xl font-black text-emerald-800 mt-0.5">{attendance?.classesAttended || 0}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-2xl border border-red-200">
                                <span className="text-[11px] font-semibold text-red-700 block">Absent</span>
                                <p className="text-xl font-black text-red-800 mt-0.5">{attendance?.classesAbsent || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                                <span className="text-[11px] font-semibold text-blue-700 block">Attendance %</span>
                                <p className="text-xl font-black text-blue-800 mt-0.5">{attendance?.attendancePercentage || 100}%</p>
                            </div>
                        </div>

                        {/* Attendance History Table */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Recent Attendance Log
                            </h4>
                            {attendance?.history && attendance.history.length > 0 ? (
                                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                                                <th className="py-2.5 px-4">Date</th>
                                                <th className="py-2.5 px-3">Batch</th>
                                                <th className="py-2.5 px-3">Status</th>
                                                <th className="py-2.5 px-3">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {attendance.history.map((h, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/60">
                                                    <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{h.date}</td>
                                                    <td className="py-2.5 px-3 text-slate-600">{h.batchName}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                                                h.status === "present"
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : h.status === "late"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {h.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-400">{h.remarks || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                                    No attendance sessions have been conducted for this batch yet.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* SECTION E: COURSE PROGRESS */}
                    <Card padding="p-6" className="border-slate-200 space-y-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    Curriculum Progress & Topics Mastery
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Evaluated by certified institute lab mentors
                                </p>
                            </div>
                            <span className="text-base font-extrabold text-blue-600">
                                {progress?.progressPercentage || 50}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700"
                                style={{ width: `${progress?.progressPercentage || 50}%` }}
                            />
                        </div>

                        {/* Topics Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Completed */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                                    Completed Topics ({progress?.completedTopics?.length || 0})
                                </span>
                                <div className="space-y-1.5 text-xs">
                                    {progress?.completedTopics?.map((t, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-800">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pending */}
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Upcoming Practical Topics ({progress?.pendingTopics?.length || 0})
                                </span>
                                <div className="space-y-1.5 text-xs">
                                    {progress?.pendingTopics?.map((t, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
                                            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                            <span>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: SECTION A (STUDENT PROFILE) & INSTITUTE SUPPORT */}
                <div className="space-y-8">
                    {/* SECTION A: STUDENT PROFILE CARD */}
                    <Card padding="p-6" className="border-slate-200 space-y-4 shadow-xs">
                        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-sm ring-2 ring-blue-50">
                                {profile?.fullName ? profile.fullName[0].toUpperCase() : "S"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900 text-base truncate">{profile?.fullName}</h3>
                                <p className="font-mono text-xs font-bold text-blue-600 mt-0.5">{profile?.studentId}</p>
                                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                                    Active Student
                                </span>
                            </div>
                        </div>

                        {/* Profile Info Details */}
                        <div className="space-y-2.5 text-xs text-slate-600">
                            <div className="flex items-start gap-2.5">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span className="truncate">{profile?.email}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>{profile?.mobile || "Not provided"}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>Admission: {profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString("en-IN") : "2026"}</span>
                            </div>
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span>Role: <strong className="text-blue-600 uppercase">{profile?.role}</strong></span>
                            </div>
                        </div>
                    </Card>

                    {/* Study Materials & Resources Card */}
                    <Card padding="p-6" className="border-slate-200 space-y-4 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Academic Resources
                        </span>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Study Materials</p>
                                    <p className="text-xs text-slate-500">PDFs, Lab Guides & Notes</p>
                                </div>
                            </div>
                            <span className="text-base font-extrabold text-blue-600">
                                {progress?.learningMaterialsCount || 0}
                            </span>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Evaluations</p>
                                    <p className="text-xs text-slate-500">Lab Practice Tests</p>
                                </div>
                            </div>
                            <span className="text-base font-extrabold text-purple-600">
                                {progress?.assignmentsCount || 1}
                            </span>
                        </div>
                    </Card>

                    {/* Institute Lab Assistance */}
                    <Card className="p-6 space-y-3 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            Need Help or Schedule Change?
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Course timings and batch allocations are strictly managed by institute administrators. To request a batch or timing update, please contact the coordinator.
                        </p>
                        <div className="pt-2">
                            <Link to="/contact">
                                <Button variant="accent" size="sm" className="w-full">
                                    Contact Lab Coordinator
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
