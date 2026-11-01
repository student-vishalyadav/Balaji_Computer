import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Users,
    UserCheck,
    UserX,
    GraduationCap,
    BookOpen,
    Layers,
    CreditCard,
    AlertCircle,
    ArrowUpRight,
    TrendingUp,
    Calendar,
    Clock,
    RefreshCw,
    Award,
    ShieldCheck,
    CheckCircle2,
} from "lucide-react";
import { adminAPI } from "../../../services/api";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Skeleton } from "../../../components/common/Skeleton";

export const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await adminAPI.getDashboardStats();
            if (res?.success && res.data) {
                setData(res.data);
            }
        } catch (err) {
            setError(err.message || "Failed to load dashboard statistics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-5 space-y-3" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-white rounded-3xl border border-slate-200" />
                    <div className="h-80 bg-white rounded-3xl border border-slate-200" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-red-200 space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Failed to load Dashboard data</h3>
                <p className="text-sm text-slate-500">{error}</p>
                <Button variant="primary" size="sm" onClick={fetchStats} icon={RefreshCw}>
                    Retry Loading
                </Button>
            </div>
        );
    }

    const { metrics, charts, recentStudents, recentPayments, upcomingExams, recentActivities } = data;

    // Helper for max values in SVG charts
    const maxStudentsMonth = Math.max(...(charts?.monthlyAdmissions?.map((m) => m.students) || [10]), 10);
    const maxFeeMonth = Math.max(...(charts?.monthlyFees?.map((m) => m.amount) || [100000]), 100000);

    return (
        <div className="space-y-8">
            {/* Top Header & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Executive Overview
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Real-time academic records, student enrollment, fee collections, and laboratory schedules.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button variant="outline" size="sm" onClick={fetchStats} icon={RefreshCw}>
                        Refresh Data
                    </Button>
                    <Link to="/admin/students">
                        <Button variant="primary" size="sm" icon={Users}>
                            Manage Students
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 8 Metric Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Students */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Students
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.totalStudents.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> All-time Registered
                        </p>
                    </div>
                </Card>

                {/* 2. Active Students */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Active Students
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.activeStudents.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Attending Lab Batches</p>
                    </div>
                </Card>

                {/* 3. Inactive Students */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Inactive / Completed
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                            <UserX className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.inactiveStudents.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Alumni or Paused</p>
                    </div>
                </Card>

                {/* 4. Total Faculty */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Total Faculty
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.totalFaculty.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Instructors & Mentors</p>
                    </div>
                </Card>

                {/* 5. Total Courses */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Active Courses
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.totalCourses.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Diplomas & Certificates</p>
                    </div>
                </Card>

                {/* 6. Total Batches */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Active Batches
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {metrics.totalBatches.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Morning & Evening Slots</p>
                    </div>
                </Card>

                {/* 7. Total Fees Collected */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Fees Collected
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
                            ₹{metrics.totalFeesCollected.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">Verified Revenue</p>
                    </div>
                </Card>

                {/* 8. Pending Fees */}
                <Card hoverable={true} className="p-5 border-slate-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Pending Fees
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
                            ₹{metrics.totalPendingFees.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-amber-700 font-semibold mt-1">Outstanding Balance</p>
                    </div>
                </Card>
            </div>

            {/* Visual Analytics Grid: Admissions Line Chart & Fee Collections Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Monthly Admissions Chart */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Monthly Student Admissions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Enrollment growth pattern across months</p>
                        </div>
                        <Badge variant="primary" size="sm">
                            Line Chart
                        </Badge>
                    </div>

                    {/* Interactive CSS / SVG Line Graph */}
                    <div className="pt-4">
                        <div className="h-48 flex items-end gap-2 sm:gap-4 relative border-b border-slate-200 pb-2">
                            {charts.monthlyAdmissions?.map((item, idx) => {
                                const heightPercent = Math.max(8, Math.round((item.students / maxStudentsMonth) * 100));
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                                        {/* Hover Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-10 pointer-events-none">
                                            {item.students} Students
                                        </div>
                                        {/* Bar / Column */}
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-blue-700 to-blue-500 group-hover:to-blue-400 transition-all duration-300"
                                        />
                                        <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>

                {/* 2. Monthly Fee Collection Bar Chart */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Monthly Fee Collection</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Total cash & online installments received</p>
                        </div>
                        <Badge variant="success" size="sm">
                            Financial Bar
                        </Badge>
                    </div>

                    <div className="pt-4">
                        <div className="h-48 flex items-end gap-2 sm:gap-4 relative border-b border-slate-200 pb-2">
                            {charts.monthlyFees?.map((item, idx) => {
                                const heightPercent = Math.max(8, Math.round((item.amount / maxFeeMonth) * 100));
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap z-10 pointer-events-none">
                                            ₹{(item.amount / 1000).toFixed(0)}k
                                        </div>
                                        {/* Bar */}
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-500 group-hover:to-emerald-400 transition-all duration-300"
                                        />
                                        <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Course-wise Distribution & Attendance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Course Distribution */}
                <Card className="p-6 space-y-5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Course-wise Student Distribution</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Popularity breakdown across institute diplomas</p>
                        </div>
                        <Link to="/admin/courses" className="text-xs font-semibold text-blue-600 hover:underline">
                            View All Courses
                        </Link>
                    </div>

                    <div className="space-y-3 pt-2">
                        {charts.courseDistribution?.map((c, i) => {
                            const totalCount = charts.courseDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
                            const pct = Math.round((c.count / totalCount) * 100);
                            const colors = ["bg-blue-600", "bg-emerald-600", "bg-amber-500", "bg-purple-600", "bg-indigo-600", "bg-rose-600"];
                            return (
                                <div key={i} className="space-y-1 text-xs">
                                    <div className="flex justify-between font-semibold">
                                        <span className="text-slate-700">{c.course}</span>
                                        <span className="text-slate-900 font-bold">{c.count} Students ({pct}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${pct}%` }}
                                            className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Attendance Summary */}
                <Card className="p-6 space-y-5 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-950 text-white border-0">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                Biometric Attendance
                            </span>
                            <Badge variant="success" size="sm">
                                94.2% Rate
                            </Badge>
                        </div>

                        <div className="py-6 text-center space-y-2">
                            <p className="text-4xl font-extrabold text-white">94.2%</p>
                            <p className="text-xs text-slate-300">Monthly Institute Attendance Average</p>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                            <div className="flex justify-between py-1">
                                <span>Batch Status:</span>
                                <span className="font-bold text-white">4 Active Batches</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Lab Terminals Used:</span>
                                <span className="font-bold text-white">42 / 45 Stations</span>
                            </div>
                        </div>
                    </div>

                    <Link to="/admin/attendance" className="pt-4">
                        <Button variant="accent" size="sm" className="w-full">
                            Open Attendance Register
                        </Button>
                    </Link>
                </Card>
            </div>

            {/* Bottom 2 Columns: Recent Registrations & Recent Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Student Registrations */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">Recent Student Admissions</h3>
                        <Link to="/admin/students" className="text-xs font-semibold text-blue-600 hover:underline">
                            View All ({metrics.totalStudents})
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                        {recentStudents && recentStudents.length > 0 ? (
                            recentStudents.map((s) => (
                                <div key={s._id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                                            {s.fullName ? s.fullName[0].toUpperCase() : "S"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{s.fullName}</p>
                                            <p className="text-slate-500 font-mono text-[11px]">{s.studentId || s.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-blue-600 block">{s.course}</span>
                                        <Badge variant={s.isActive ? "success" : "secondary"} size="sm">
                                            {s.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 py-4 text-center">No recent admissions recorded.</p>
                        )}
                    </div>
                </Card>

                {/* Recent Payments */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900">Recent Fee Collections</h3>
                        <Link to="/admin/fees" className="text-xs font-semibold text-blue-600 hover:underline">
                            Open Fee Ledger
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                        {recentPayments && recentPayments.length > 0 ? (
                            recentPayments.map((p, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900">{p.studentName}</p>
                                        <p className="text-slate-500 text-[11px] font-mono">
                                            Receipt: #{p.receiptNumber} • {p.paymentMethod?.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-emerald-600">
                                            +₹{p.amount?.toLocaleString("en-IN")}
                                        </p>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(p.paymentDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 py-4 text-center">No fee transactions logged yet.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

