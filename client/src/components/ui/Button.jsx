import React from "react";
import { Loader2 } from "lucide-react";

export const Button = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = "left",
    className = "",
    type = "button",
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none";

    const sizeStyles = {
        sm: "text-xs px-3.5 py-1.5 gap-1.5",
        md: "text-sm px-5 py-2.5 gap-2",
        lg: "text-base px-6 py-3.5 gap-2.5 font-semibold",
    };

    const variantStyles = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500 active:bg-blue-800",
        secondary:
            "bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md focus:ring-slate-700 active:bg-slate-950",
        accent:
            "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm hover:shadow-md focus:ring-amber-400 active:bg-amber-700",
        outline:
            "border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-300 shadow-xs",
        ghost:
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-200",
        danger:
            "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500 active:bg-red-800",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            {!loading && Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
            {children}
            {!loading && Icon && iconPosition === "right" && <Icon className="w-4 h-4 shrink-0" />}
        </button>
    );
};

export default Button;

