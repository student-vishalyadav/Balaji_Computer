import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

export const DashboardRedirect = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loader fullPage={true} text="Routing to your dashboard..." />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role determined strictly by server
    switch (user.role) {
        case "admin":
            return <Navigate to="/admin/dashboard" replace />;
        case "faculty":
            return <Navigate to="/faculty/dashboard" replace />;
        case "student":
        default:
            return <Navigate to="/student/dashboard" replace />;
    }
};

export default DashboardRedirect;

