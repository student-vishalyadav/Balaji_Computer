import React, { useState, useEffect, useRef } from "react";
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
    Bell,
    Check,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { notificationAPI } from "../services/api";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export const StudentLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Student Notifications
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getStudentNotifications();
            if (res?.success) {
                setNotifications(res.notifications || []);
                setUnreadCount(res.unreadCount || 0);
            }
        } catch {
            // Silently handle
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 25000);
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllStudentRead();
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark notifications as read");
        }
    };

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
                                {user?.studentId || "Student Portal"}
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
                        {/* Student Notifications Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Student Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Popover Dropdown */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-blue-600" />
                                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                                                Institute & Course Updates
                                            </span>
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                                                        !notif.isRead
                                                            ? "bg-blue-50/50"
                                                            : "hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                            !notif.isRead ? "bg-blue-600" : "bg-transparent"
                                                        }`}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 leading-snug">
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-slate-600 mt-0.5 leading-relaxed">
                                                            {notif.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-slate-400 text-xs">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/">
                            <Button variant="outline" size="sm" icon={Home}>
                                View Website
                            </Button>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
