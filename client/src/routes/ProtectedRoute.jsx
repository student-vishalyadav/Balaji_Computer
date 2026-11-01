import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import Button from "../components/ui/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <Loader fullPage={true} text="Verifying authentication session..." />;
    }

    // Unauthenticated user -> Redirect to Login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                            Your account with role <span className="font-semibold text-slate-800 uppercase">({user.role})</span> does
                            not have authorization to view this section.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Link to="/dashboard">
                            <Button variant="primary" size="md" className="w-full">
                                Go to Your Dashboard
                            </Button>
                        </Link>
                        <Link to="/">
                            <Button variant="outline" size="md" className="w-full" icon={ArrowLeft}>
                                Return to Homepage
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;

