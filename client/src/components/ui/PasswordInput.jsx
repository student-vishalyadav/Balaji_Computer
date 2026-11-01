import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export const PasswordInput = ({
    label = "Password",
    id,
    name = "password",
    value,
    onChange,
    error,
    helperText,
    required = false,
    showStrength = false,
    disabled = false,
    placeholder = "Enter your password",
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name;

    // Calculate simple password strength
    const getStrength = (pass) => {
        if (!pass) return { score: 0, text: "", color: "" };
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

        switch (score) {
            case 1:
                return { score: 25, text: "Weak", color: "bg-red-500", textCol: "text-red-600" };
            case 2:
                return { score: 50, text: "Fair", color: "bg-amber-500", textCol: "text-amber-600" };
            case 3:
                return { score: 75, text: "Good", color: "bg-blue-500", textCol: "text-blue-600" };
            case 4:
                return { score: 100, text: "Strong", color: "bg-green-600", textCol: "text-green-600" };
            default:
                return { score: 15, text: "Too weak", color: "bg-red-400", textCol: "text-red-500" };
        }
    };

    const strength = showStrength && value ? getStrength(value) : null;

    return (
        <div className={`w-full text-left ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                </div>

                <input
                    id={inputId}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    aria-invalid={!!error}
                    className={`block w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
                        error
                            ? "border-red-400 focus:ring-red-500 text-red-900 placeholder:text-red-300"
                            : "border-slate-300 hover:border-slate-400"
                    }`}
                    {...props}
                />

                <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                </button>
            </div>

            {showStrength && value && strength && (
                <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500">Password strength:</span>
                        <span className={`font-semibold ${strength.textCol}`}>{strength.text}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: `${strength.score}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 font-medium">
                    {error}
                </p>
            )}

            {!error && helperText && !showStrength && (
                <p id={`${inputId}-helper`} className="mt-1 text-xs text-slate-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default PasswordInput;

