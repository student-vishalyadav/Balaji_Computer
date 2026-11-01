import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    BookOpen,
    ArrowLeft,
    CheckCircle2,
    ShieldAlert,
    Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { courseAPI } from "../../services/api";
import Logo from "../../components/common/Logo";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const Register = () => {
    const { signup, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        course: searchParams.get("course") || "",
        gender: "",
        agreeTerms: false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate("/student/dashboard", { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Fetch active courses dynamically for dropdown
    useEffect(() => {
        const fetchCoursesList = async () => {
            try {
                const response = await courseAPI.getAll();
                if (response?.success && response.courses) {
                    setCourses(response.courses);
                }
            } catch (err) {
                console.error("Could not load dynamic courses for registration dropdown:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCoursesList();
    }, []);

    // Set course from URL if provided
    useEffect(() => {
        const queryCourse = searchParams.get("course");
        if (queryCourse) {
            setFormData((prev) => ({ ...prev, course: queryCourse }));
        }
    }, [searchParams]);

    const validate = () => {
        const newErrors = {};

        // Full Name
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Name must be at least 3 characters";
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
        }

        // Mobile (Indian 10-digit standard or generic phone)
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^\+?[0-9]{10,12}$/.test(formData.mobile.replace(/[\s-]/g, ""))) {
            newErrors.mobile = "Please enter a valid 10-digit mobile number";
        }

        // Password
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        // Confirm Password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Select Course
        if (!formData.course) {
            newErrors.course = "Please select a target course";
        }

        // Terms and conditions
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "You must accept the terms and conditions to register";
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
        if (!validate()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                fullName: formData.fullName.trim(),
                username: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
                mobile: formData.mobile.trim(),
                password: formData.password,
                course: formData.course,
                gender: formData.gender,
            };

            const result = await signup(payload);
            toast.success("Account created successfully! Welcome to Balaji Computer.");
            // Redirect to student dashboard
            navigate("/student/dashboard", { replace: true });
        } catch (error) {
            const errorMsg =
                error.message || "Registration failed. An account with this email may already exist.";
            toast.error(errorMsg);
            setErrors({ general: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
            <div className="max-w-2xl w-full mx-auto">
                {/* Back Link & Brand Logo */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <Logo size="sm" showTagline={false} />
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-8">
                    {/* Header */}
                    <div className="border-b border-slate-100 pb-6 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Student Enrollment
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Create Your Student Account
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Join Balaji Computer to acquire practical, industry-certified computer and accounting skills.
                        </p>
                    </div>

                    {/* General Error Banner */}
                    {errors.general && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{errors.general}</span>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* 2-Column Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <Input
                                label="Full Name"
                                name="fullName"
                                placeholder="e.g. Rahul Sharma"
                                value={formData.fullName}
                                onChange={handleChange}
                                error={errors.fullName}
                                icon={User}
                                required
                            />

                            {/* Email Address */}
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="rahul@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                icon={Mail}
                                required
                            />

                            {/* Mobile Number */}
                            <Input
                                label="Mobile Number"
                                name="mobile"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={errors.mobile}
                                icon={Phone}
                                required
                            />

                            {/* Course Dropdown (Dynamic) */}
                            <div className="text-left">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Target Course <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-xs">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <select
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                                            errors.course
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-slate-300 hover:border-slate-400"
                                        }`}
                                    >
                                        <option value="">-- Choose a Course --</option>
                                        {courses.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.title} ({c.duration})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.course && (
                                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.course}</p>
                                )}
                            </div>

                            {/* Gender (Optional) */}
                            <div className="text-left sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Gender <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["male", "female", "other"].map((g) => (
                                        <label
                                            key={g}
                                            className={`flex items-center justify-center py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all capitalize ${
                                                formData.gender === g
                                                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={g}
                                                checked={formData.gender === g}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            {g}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Password with Strength Indicator */}
                            <div className="sm:col-span-2">
                                <PasswordInput
                                    label="Create Password"
                                    name="password"
                                    placeholder="Minimum 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    showStrength={true}
                                    required
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="sm:col-span-2">
                                <PasswordInput
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                    showStrength={false}
                                    required
                                />
                            </div>
                        </div>

                        {/* Agree to Terms & Privacy */}
                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer select-none text-xs text-slate-600">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                                />
                                <span>
                                    I agree to the institute's{" "}
                                    <span className="font-semibold text-blue-600">
                                        Admission Code of Conduct, Lab Rules
                                    </span>{" "}
                                    and Terms & Conditions.
                                </span>
                            </label>
                            {errors.agreeTerms && (
                                <p className="mt-1 text-xs text-red-600 font-medium">{errors.agreeTerms}</p>
                            )}
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
                            Complete Registration & Open Dashboard
                        </Button>
                    </form>

                    {/* Existing Account Footer Link */}
                    <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
                        Already have an enrolled account?{" "}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline">
                            Sign In Here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

