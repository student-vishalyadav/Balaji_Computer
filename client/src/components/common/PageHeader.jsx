import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import Badge from "../ui/Badge";

export const PageHeader = ({ title, subtitle, badge, breadcrumbs = [] }) => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 py-12 md:py-16 border-b border-slate-200/60">
            {/* Background geometric accents */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-100/30 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center justify-center md:justify-start gap-2 text-xs font-medium text-slate-500 mb-4">
                        <Link to="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                            <Home className="w-3.5 h-3.5" />
                            <span>Home</span>
                        </Link>
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                {crumb.to ? (
                                    <Link to={crumb.to} className="hover:text-blue-600 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-800 font-semibold">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}

                {badge && (
                    <div className="mb-3 flex justify-center md:justify-start">
                        <Badge variant="primary" size="md">
                            {badge}
                        </Badge>
                    </div>
                )}

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
};

export default PageHeader;

