import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    BookOpen,
    Layers,
    CalendarCheck,
    CreditCard,
    Award,
    FileText,
    Bell,
    BarChart3,
    Settings,
    LogOut,
    Home,
    ShieldCheck,
    Menu,
    X,
    ChevronRight,
    Search,
    ExternalLink,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/common/Logo";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Administrator session signed out");
            navigate("/login");
        } catch {
            navigate("/login");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Students", path: "/admin/students", icon: Users },
        { label: "Faculty", path: "/admin/faculty", icon: UserCheck },
        { label: "Courses", path: "/admin/courses", icon: BookOpen },
        { label: "Batches", path: "/admin/batches", icon: Layers },
        { label: "Attendance", path: "/admin/attendance", icon: CalendarCheck },
        { label: "Fees & Payments", path: "/admin/fees", icon: CreditCard },
        { label: "Examinations", path: "/admin/examinations", icon: Award },
        { label: "Study Materials", path: "/admin/materials", icon: FileText },
        { label: "Notices & Alerts", path: "/admin/notices", icon: Bell },
        { label: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
        { label: "Settings", path: "/admin/settings", icon: Settings },
    ];

    // Compute active breadcrumb title
    const currentNavItem = navItems.find((item) => location.pathname.startsWith(item.path));
    const pageTitle = currentNavItem ? currentNavItem.label : "Admin Portal";

    return (
        <div className="min-h-screen flex bg-slate-100 selection:bg-blue-600 selection:text-white">
            {/* Desktop Fixed Sidebar */}
            <aside className="hidden lg:flex w-64 bg-slate-950 text-white flex-col justify-between shrink-0 border-r border-slate-800 h-screen sticky top-0 z-30">
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-800/80 shrink-0">
                        <Logo light={true} size="sm" showTagline={true} />
                    </div>

                    {/* Admin Status Card */}
                    <div className="px-4 py-3 shrink-0">
                        <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">{user?.fullName || "Administrator"}</p>
                                <span className="text-[10px] text-blue-400 font-semibold tracking-wide uppercase">
                                    Admin Control
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-none text-xs font-medium">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                                            isActive
                                                ? "bg-blue-600 text-white font-semibold shadow-xs"
                                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Utility Bar */}
                    <div className="p-4 border-t border-slate-800/80 space-y-2 shrink-0">
                        <Link
                            to="/"
                            target="_blank"
                            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors text-xs font-medium"
                        >
                            <span className="flex items-center gap-2">
                                <Home className="w-4 h-4" /> Live Website
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer Backdrop */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile Slide-Out Sidebar Drawer */}
            <div
                className={`fixed inset-y-0 left-0 w-72 bg-slate-950 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between ${
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div>
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <Logo light={true} size="sm" showTagline={true} />
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="p-4 space-y-1 max-h-[70vh] overflow-y-auto text-sm">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                                            isActive
                                                ? "bg-blue-600 text-white font-semibold"
                                                : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        }`
                                    }
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link
                        to="/"
                        target="_blank"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm"
                    >
                        <span className="flex items-center gap-2">
                            <Home className="w-4 h-4" /> Live Website
                        </span>
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-950/40 rounded-xl"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Viewport */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                {/* Top Sticky Header */}
                <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <Link to="/admin/dashboard" className="hover:text-blue-600 hidden sm:inline">
                                Admin
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                            <span className="text-slate-900 font-bold text-sm sm:text-base">{pageTitle}</span>
                        </div>
                    </div>

                    {/* Top Right Utility Badges */}
                    <div className="flex items-center gap-3">
                        <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            Session: 2026-2027
                        </span>

                        <Link to="/" target="_blank" className="hidden sm:inline-block">
                            <Button variant="outline" size="sm" icon={ExternalLink} iconPosition="right">
                                Public Site
                            </Button>
                        </Link>

                        {/* Admin Avatar */}
                        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                A
                            </div>
                            <span className="text-xs font-semibold text-slate-900 hidden sm:inline">
                                {user?.fullName || "Admin"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Viewport */}
                <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
