import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    User,
    LogOut,
    LayoutDashboard,
    ChevronDown,
    BookOpen,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Logo from "./Logo";
import Button from "../ui/Button";
import toast from "react-hot-toast";

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sticky shadow on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully! Have a great day.");
            navigate("/");
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    // Role-based dashboard link
    const getDashboardPath = () => {
        if (!user) return "/dashboard";
        switch (user.role) {
            case "admin":
                return "/admin/dashboard";
            case "faculty":
                return "/faculty/dashboard";
            case "student":
            default:
                return "/student/dashboard";
        }
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "Courses", path: "/courses" },
        { name: "Our Faculty", path: "/faculty" },
        { name: "Contact", path: "/contact" },
    ];

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <header
            className={`sticky top-0 z-40 w-full transition-all duration-300 ${
                scrolled
                    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80"
                    : "bg-white/80 backdrop-blur-xs border-b border-slate-200/50"
            }`}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 min-w-0">
                    {/* Left: Brand Logo & Tagline */}
                    <div className="flex items-center shrink-0 min-w-0">
                        <Logo size="md" showTagline={true} responsiveTagline={true} />
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) =>
                                    `px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
                                        isActive
                                            ? "text-blue-600 bg-blue-50/80 font-semibold"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right: Auth State (Desktop) */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName || user.username}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            getInitials(user?.fullName || user?.username)
                                        )}
                                    </div>

                                    {/* Name & Role */}
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">
                                            {user?.fullName || user?.username}
                                        </span>
                                        <span className="text-[10px] font-medium text-blue-600 capitalize">
                                            {user?.role || "Student"}
                                        </span>
                                    </div>

                                    <ChevronDown
                                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                            profileDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {/* Profile Dropdown Menu */}
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Signed in as
                                            </p>
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {user?.fullName || user?.username}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-md">
                                                Role: {user?.role || "Student"}
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to={getDashboardPath()}
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>

                                            <Link
                                                to="/courses"
                                                onClick={() => setProfileDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4 text-slate-400" />
                                                <span>Explore Courses</span>
                                            </Link>
                                        </div>

                                        <div className="pt-1 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Link to="/login">
                                    <Button variant="ghost" size="md">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="md" icon={Sparkles} iconPosition="right">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center lg:hidden gap-2">
                        {isAuthenticated && (
                            <Link
                                to={getDashboardPath()}
                                className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center"
                                title="Go to Dashboard"
                            >
                                {getInitials(user?.fullName || user?.username)}
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer Navigation */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
                    <nav className="flex flex-col space-y-1">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `px-4 py-2.5 text-base font-medium rounded-xl transition-colors ${
                                        isActive
                                            ? "text-blue-600 bg-blue-50 font-semibold"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                                        {getInitials(user?.fullName || user?.username)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {user?.fullName || user?.username}
                                        </p>
                                        <p className="text-xs text-slate-500 capitalize">Role: {user?.role}</p>
                                    </div>
                                </div>

                                <Link
                                    to={getDashboardPath()}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block"
                                >
                                    <Button variant="primary" className="w-full" icon={LayoutDashboard}>
                                        Open {user?.role ? user.role.toUpperCase() : "STUDENT"} Dashboard
                                    </Button>
                                </Link>

                                <Button
                                    variant="outline"
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                    icon={LogOut}
                                    onClick={handleLogout}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="primary" className="w-full" icon={Sparkles} iconPosition="right">
                                        Get Started / Register
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;

