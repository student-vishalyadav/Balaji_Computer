import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, ShieldCheck, Award, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Logo from "../../components/common/Logo";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const Login = () => {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect to role dashboard
    React.useEffect(() => {
        if (isAuthenticated && user) {
            redirectByRole(user.role);
        }
    }, [isAuthenticated, user]);

    const redirectByRole = (role) => {
        const from = location.state?.from?.pathname;
        if (from && from !== "/login" && from !== "/signup") {
            navigate(from, { replace: true });
            return;
        }

        switch (role) {
            case "admin":
                navigate("/admin/dashboard", { replace: true });
                break;
            case "faculty":
                navigate("/faculty/dashboard", { replace: true });
                break;
            case "student":
            default:
                navigate("/student/dashboard", { replace: true });
                break;
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const result = await login({
                email: formData.email.trim(),
                password: formData.password,
            });

            toast.success(`Welcome back, ${result.user?.fullName || result.user?.username || "Student"}!`);
            redirectByRole(result.user?.role);
        } catch (error) {
            const errorMsg = error.message || "Invalid credentials. Please verify your email and password.";
            toast.error(errorMsg);
            setErrors({ general: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Column: Educational Branding & Trust (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
                {/* Background decorative glows */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Branding */}
                <div className="relative z-10">
                    <Logo light={true} size="lg" showTagline={true} />
                </div>

                {/* Central Educational Message */}
                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Authorized Coaching Portal
                    </div>

                    <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
                        Empowering Careers Through Practical Computer Skills.
                    </h2>

                    <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
                        Access your student portal to view enrolled courses, exam results, batch timings,
                        and specialized practice materials designed for high job performance.
                    </p>

                    {/* Trust Pillars */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-3 text-sm text-slate-200">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                <Award className="w-4 h-4" />
                            </div>
                            <span>Government Recognized Computer Certification</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-200">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <span>Hands-On Laboratory Training with Live Projects</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-200">
                            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span>Secure Role-Based Student & Faculty Access</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="relative z-10 text-xs text-slate-400 border-t border-slate-800/80 pt-6 flex items-center justify-between">
                    <span>© {new Date().getFullYear()} Balaji Computer</span>
                    <span className="text-amber-400/90 font-medium">Learn Today, Lead Tomorrow.</span>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 xl:px-24">
                <div className="max-w-md w-full mx-auto space-y-8">
                    {/* Top Back Link & Mobile Logo */}
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <div className="lg:hidden">
                            <Logo size="sm" showTagline={false} />
                        </div>
                    </div>

                    {/* Header */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Sign In to Your Account
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your registered institute credentials to access your dashboard.
                        </p>
                    </div>

                    {/* General Error Banner */}
                    {errors.general && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium animate-in fade-in">
                            {errors.general}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon={Mail}
                            required
                            autoComplete="email"
                        />

                        {/* Password */}
                        <div>
                            <PasswordInput
                                label="Password"
                                name="password"
                                placeholder="Enter your secret password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-slate-600 font-medium">Remember me</span>
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Demo / Test Account Helper Hint */}
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-blue-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Secure Institute Authentication
                        </p>
                        <p className="text-slate-500">
                            New student?{" "}
                            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                                Register your account here
                            </Link>{" "}
                            to enroll into courses.
                        </p>
                    </div>

                    {/* Footer signup prompt */}
                    <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
                        Don't have an account yet?{" "}
                        <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                            Register as Student
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

