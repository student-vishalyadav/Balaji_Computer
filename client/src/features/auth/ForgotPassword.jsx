import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, ShieldAlert, Sparkles, Clock } from "lucide-react";
import Logo from "../../components/common/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            toast.error("Please enter your registered email address.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authAPI.forgotPassword(cleanEmail);
            setSubmitted(true);
            toast.success(
                response?.msg || "If an account exists with this email address, a password reset link has been sent."
            );
        } catch (error) {
            const message =
                error.data?.msg ||
                error.message ||
                "Failed to process password reset request. Please try again later.";
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

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
                    {submitted ? (
                        <div className="text-center py-4 space-y-5">
                            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle className="w-8 h-8" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Check Your Inbox</h2>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                                    If an account exists with this email address, a password reset link has been sent.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs text-amber-900 space-y-2">
                                <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" /> Link Validity Notice
                                </div>
                                <p className="text-amber-800/90 leading-relaxed">
                                    • The password reset link expires in <strong>15 minutes</strong> for security reasons.
                                    <br />
                                    • If you do not see the email, check your Spam or Junk folder.
                                </p>
                            </div>

                            <div className="pt-2">
                                <Link to="/login">
                                    <Button variant="primary" size="lg" className="w-full">
                                        Return to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                    <Sparkles className="w-3.5 h-3.5" /> Account Recovery
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Forgot Password?
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                                    Enter your registered email address and we'll send you a secure link to reset your account password.
                                </p>
                            </div>

                            {errorMsg && (
                                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div>
                                <Input
                                    label="Registered Email Address"
                                    name="email"
                                    type="email"
                                    placeholder="admin@balajicomputer.edu"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (errorMsg) setErrorMsg("");
                                    }}
                                    icon={Mail}
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                loading={isLoading}
                                disabled={isLoading}
                            >
                                Send Password Reset Link
                            </Button>

                            <div className="text-center pt-2 border-t border-slate-100">
                                <Link
                                    to="/login"
                                    className="text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
                                >
                                    Remembered your password? <span className="text-blue-600 font-bold">Sign In</span>
                                </Link>
                            </div>
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

export default ForgotPassword;
