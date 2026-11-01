import React from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Clock,
    Award,
    Calendar,
    CheckCircle,
    User,
    ArrowUpRight,
    Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export const Dashboard = () => {
    const { user } = useAuth();

    const enrolledCourseName = user?.course || "ADCA (Advanced Diploma in Computer Applications)";

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Balaji Computer Student Portal
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Welcome back, {user?.fullName || user?.username}!
                    </h1>
                    <p className="text-blue-100 text-sm leading-relaxed">
                        Track your academic progress, computer practical lab batches, upcoming exams, and certified skill evaluations all in one place.
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Active Course
                        </span>
                        <p className="text-base font-bold text-slate-900 truncate max-w-[150px]">
                            {enrolledCourseName}
                        </p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Attendance
                        </span>
                        <p className="text-lg font-bold text-slate-900">92.5%</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Lab Batch
                        </span>
                        <p className="text-base font-bold text-slate-900">10:00 AM - 12:00 PM</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-4 p-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Certification
                        </span>
                        <p className="text-base font-bold text-slate-900">In Progress</p>
                    </div>
                </Card>
            </div>

            {/* Course Progress & Modules Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Enrolled Program */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                    Enrolled Curriculum
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mt-1">{enrolledCourseName}</h3>
                            </div>
                            <Badge variant="success" size="md">
                                Enrolled & Active
                            </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-600">Overall Course Completion</span>
                                <span className="text-blue-600">45%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full rounded-full transition-all duration-500 w-[45%]" />
                            </div>
                        </div>

                        {/* Completed Modules Checklist */}
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Syllabus Breakdown
                            </h4>
                            <div className="space-y-2 text-sm">
                                {[
                                    { title: "Computer Fundamentals & Operating Systems", status: "Completed" },
                                    { title: "MS Office Suite (Word, Excel & PowerPoint)", status: "Completed" },
                                    { title: "Accounting with Tally Prime & GST Billing", status: "In Progress" },
                                    { title: "Desktop Publishing (Photoshop & CorelDRAW)", status: "Upcoming" },
                                    { title: "Practical Capstone Project & Typing Certification", status: "Upcoming" },
                                ].map((mod, i) => (
                                    <div
                                        key={i}
                                        className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-white font-bold text-xs text-slate-600 flex items-center justify-center border border-slate-200">
                                                {i + 1}
                                            </span>
                                            <span className="font-medium text-slate-800">{mod.title}</span>
                                        </div>
                                        <span
                                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                mod.status === "Completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : mod.status === "In Progress"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-slate-200 text-slate-600"
                                            }`}
                                        >
                                            {mod.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right 1 Col: Student Info & Institute Support */}
                <div className="space-y-6">
                    {/* Profile Summary Card */}
                    <Card className="p-6 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                            Student Profile
                        </h4>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Full Name</span>
                                <span className="font-semibold text-slate-800">{user?.fullName || user?.username}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Email</span>
                                <span className="font-semibold text-slate-800">{user?.email}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">Mobile</span>
                                <span className="font-semibold text-slate-800">{user?.mobile || "Not provided"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-400">System Role</span>
                                <span className="font-semibold text-blue-600 uppercase">{user?.role}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Lab Timings & Support */}
                    <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                            Institute Lab Assistance
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Need help with practical assignments or lab workstation scheduling? Our lab instructors are available Monday through Saturday.
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

