import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    size = "md",
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeStyles = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Box */}
            <div
                className={`relative w-full ${sizeStyles[size]} bg-white rounded-3xl shadow-2xl border border-slate-100 z-10 overflow-hidden transform transition-all animate-in zoom-in-95`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        {title && <h3 className="text-xl font-bold text-slate-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

