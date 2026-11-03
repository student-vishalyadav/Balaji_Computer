import React, { useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, ShieldAlert, Sparkles, Check, KeyRound, AlertTriangle } from "lucide-react";
import Logo from "../../components/common/Logo";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export const ResetPassword = () => {
    const { token: routeToken } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Support token from either URL route param (:token) or query string (?token=...)
    const token = routeToken || searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isTokenInvalid, setIsTokenInvalid] = useState(false);
    const [generalError, setGeneralError] = useState("");

    const validate = () => {
        const errors = {};
        if (!password) {
            errors.password = "New password is required.";
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters long.";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your new password.";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError("");

        if (!token) {
            toast.error("Password reset token is missing. Please request a new link.");
            setIsTokenInvalid(true);
            return;
        }

        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await authAPI.resetPassword(token, {
                password,
                confirmPassword,
            });

            setIsSuccess(true);
            toast.success(response?.msg || "Password reset successfully!");

            // Redirect to Login after 2.5 seconds
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2500);
        } catch (error) {
            const errorMsg =
                error.data?.msg ||
                error.message ||
                "Failed to reset password. The link may have expired.";
            setGeneralError(errorMsg);
            toast.error(errorMsg);

            if (
                errorMsg.toLowerCase().includes("invalid") ||
                errorMsg.toLowerCase().includes("expired")
            ) {
                setIsTokenInvalid(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // If no token was provided in the URL
    if (!token && !isSuccess) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
                <div className="max-w-md w-full mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                        <Logo size="sm" showTagline={false} />
                    </div>

                    <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
                        <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Missing Reset Token
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            No password reset token was detected in your link. Reset links must be accessed directly from the verification email sent to you.
                        </p>
                        <div className="pt-2 flex flex-col gap-2.5">
                            <Link to="/forgot-password">
                                <Button variant="primary" size="lg" className="w-full">
                                    Request a New Reset Link
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="md" className="w-full">
                                    Return to Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-6">
                {/* Top Back Link & Institute Logo */}
                <div className="flex items-center justify-between mb-2">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                    <Logo size="sm" showTagline={false} />
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-left">
                    {isSuccess ? (
                        <div className="text-center py-4 space-y-5">
                            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-in zoom-in">
                                <CheckCircle className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Password Reset Complete!
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                                    Your account password has been updated securely. You can now use your new credentials to sign in.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                <span>Redirecting you to Sign In in a few seconds...</span>
                            </div>

                            <div className="pt-2">
                                <Link to="/login">
                                    <Button variant="primary" size="lg" className="w-full">
                                        Sign In Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : isTokenInvalid ? (
                        <div className="text-center py-4 space-y-5">
                            <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <ShieldAlert className="w-7 h-7" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Link Expired or Invalid
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                                    {generalError || "This password reset link has expired or has already been used. For your security, reset links are valid for 15 minutes."}
                                </p>
                            </div>

                            <div className="pt-2 flex flex-col gap-2.5">
                                <Link to="/forgot-password">
                                    <Button variant="primary" size="lg" className="w-full">
                                        Request New Reset Link
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="md" className="w-full">
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                    <KeyRound className="w-3.5 h-3.5" /> Secure Password Reset
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Set New Password
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    Create a strong new password for your Balaji Computer account.
                                </p>
                            </div>

                            {generalError && (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{generalError}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <PasswordInput
                                    label="New Password"
                                    name="password"
                                    placeholder="Enter minimum 6 characters"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) {
                                            setFieldErrors((prev) => ({ ...prev, password: "" }));
                                        }
                                        if (generalError) setGeneralError("");
                                    }}
                                    error={fieldErrors.password}
                                    showStrength={true}
                                    required
                                    autoComplete="new-password"
                                />

                                <PasswordInput
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (fieldErrors.confirmPassword) {
                                            setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                                        }
                                        if (generalError) setGeneralError("");
                                    }}
                                    error={fieldErrors.confirmPassword}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {/* Password Requirements Guide */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                                <div className="font-semibold text-slate-800">Password Checklist:</div>
                                <div className="space-y-1 text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Check className={`w-3.5 h-3.5 ${password.length >= 6 ? "text-emerald-600" : "text-slate-300"}`} />
                                        <span>At least 6 characters in length</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Check className={`w-3.5 h-3.5 ${password && confirmPassword && password === confirmPassword ? "text-emerald-600" : "text-slate-300"}`} />
                                        <span>Both password fields match</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Reset & Save Password
                            </Button>
                        </form>
                    )}
                </div>

                {/* Institute Tagline */}
                <p className="text-center text-xs text-slate-400">
                    Balaji Computer &bull; Learn Today, Lead Tomorrow.
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
