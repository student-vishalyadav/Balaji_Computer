import React from "react";
import { Link } from "react-router-dom";

export const Logo = ({
    showTagline = true,
    responsiveTagline = true,
    size = "md",
    light = false,
    linkTo = "/",
    className = "",
}) => {
    const sizeConfig = {
        sm: {
            icon: "w-8 h-8",
            iconInner: "w-4 h-4",
            title: "text-lg",
            tagline: "text-[10px]",
        },
        md: {
            icon: "w-10 h-10",
            iconInner: "w-5 h-5",
            title: "text-xl",
            tagline: "text-xs",
        },
        lg: {
            icon: "w-13 h-13",
            iconInner: "w-7 h-7",
            title: "text-2xl",
            tagline: "text-xs",
        },
    };

    const cfg = sizeConfig[size] || sizeConfig.md;

    const content = (
        <div className={`inline-flex items-center gap-3 select-none ${className}`}>
            {/* Logo Emblem Icon */}
            <div
                className={`${cfg.icon} rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white relative shrink-0 ring-2 ring-white/50`}
            >
                {/* SVG Computer & Education Emblem */}
                <svg
                    className={cfg.iconInner}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Screen / Monitor */}
                    <rect x="2" y="3" width="20" height="13" rx="2" />
                    <line x1="8" y1="20" x2="16" y2="20" />
                    <line x1="12" y1="16" x2="12" y2="20" />
                    {/* Graduation Cap / Academic Symbol */}
                    <path d="M7 8l5-2.5 5 2.5-5 2.5z" fill="currentColor" fillOpacity="0.3" />
                </svg>
                {/* Sparkle Badge */}
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white shadow-xs" />
            </div>

            {/* Typography */}
            <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <span
                        className={`font-extrabold tracking-tight text-base sm:${cfg.title} ${
                            light ? "text-white" : "text-slate-900"
                        }`}
                    >
                        BALAJI
                    </span>
                    <span
                        className={`font-bold tracking-tight text-base sm:${cfg.title} ${
                            light ? "text-blue-300" : "text-blue-600"
                        }`}
                    >
                        COMPUTER
                    </span>
                </div>
                {showTagline && (
                    <span
                        className={`font-medium tracking-wide ${cfg.tagline} ${
                            light ? "text-slate-300" : "text-slate-500"
                        } ${responsiveTagline ? "hidden sm:inline-block" : "inline-block"}`}
                    >
                        Learn Today, Lead Tomorrow.
                    </span>
                )}
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link to={linkTo} className="hover:opacity-95 transition-opacity inline-block">
                {content}
            </Link>
        );
    }
    return content;
};

export default Logo;
