import React from "react";

export const Badge = ({
    children,
    variant = "primary",
    size = "sm",
    dot = false,
    className = "",
}) => {
    const variantStyles = {
        primary: "bg-blue-50 text-blue-700 border-blue-200",
        secondary: "bg-slate-100 text-slate-800 border-slate-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-red-50 text-red-700 border-red-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200",
        outline: "bg-transparent text-slate-600 border-slate-300",
    };

    const dotColors = {
        primary: "bg-blue-500",
        secondary: "bg-slate-500",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
        purple: "bg-purple-500",
        outline: "bg-slate-400",
    };

    const sizeStyles = {
        sm: "text-xs px-2.5 py-0.5",
        md: "text-sm px-3 py-1",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
            {children}
        </span>
    );
};

export default Badge;

