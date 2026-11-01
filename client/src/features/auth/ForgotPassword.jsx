import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Logo from "../../components/common/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        // Simulate safe recovery dispatch
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
            toast.success("Recovery details sent to institute administrator.");
        }, 800);
    };

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

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-left">
                    {submitted ? (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Check Your Email</h2>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Recovery instructions have been sent for <span className="font-semibold text-slate-800">{email}</span>.
                                If you don't receive an email within 5 minutes, please visit the institute reception with your student ID.
                            </p>
                            <Link to="/login" className="block pt-2">
                                <Button variant="primary" size="md" className="w-full">
                                    Return to Sign In
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Reset Your Password</h1>
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter your registered email address and we'll help you reset your password.
                                </p>
                            </div>

                            <Input
                                label="Registered Email Address"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={Mail}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                loading={isLoading}
                            >
                                Send Password Reset Link
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

