import React from "react";

export const Input = ({
    label,
    id,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    error,
    helperText,
    icon: Icon,
    required = false,
    disabled = false,
    className = "",
    inputClassName = "",
    ...props
}) => {
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

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
                {Icon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                )}
                <input
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    className={`block w-full rounded-xl border bg-white py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
                        Icon ? "pl-10 pr-3.5" : "px-3.5"
                    } ${
                        error
                            ? "border-red-400 focus:ring-red-500 text-red-900 placeholder:text-red-300"
                            : "border-slate-300 hover:border-slate-400"
                    } ${inputClassName}`}
                    {...props}
                />
            </div>

            {error && (
                <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600 font-medium">
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p id={`${inputId}-helper`} className="mt-1 text-xs text-slate-500">
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;

