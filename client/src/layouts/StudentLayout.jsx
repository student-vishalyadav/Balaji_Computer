import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    Award,
    FileText,
    LogOut,
    Home,
    User,
    Clock,
    Phone,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/");
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 p-5 border-r border-slate-800">
                <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-800">
                        <Logo light={true} size="sm" showTagline={true} />
                    </div>

                    {/* Student Info Pill */}
                    <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                            {user?.fullName ? user.fullName[0].toUpperCase() : "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">
                                {user?.fullName || user?.username}
                            </p>
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                Student ID #{user?._id?.slice(-4) || "001"}
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1 text-sm font-medium">
                        <Link
                            to="/student/dashboard"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>My Dashboard</span>
                        </Link>
                        <Link
                            to="/courses"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span>Explore Courses</span>
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <Home className="w-4 h-4 text-slate-400" />
                            <span>Institute Homepage</span>
                        </Link>
                    </nav>
                </div>

                {/* Bottom Signout */}
                <div className="pt-6 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Student Portal</h2>
                        <p className="text-xs text-slate-500">Welcome back, {user?.fullName || user?.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/">
                            <Button variant="outline" size="sm" icon={Home}>
                                View Website
                            </Button>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;

