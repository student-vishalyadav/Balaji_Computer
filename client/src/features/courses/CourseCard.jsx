import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Clock,
    Award,
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Star,
    Layers,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export const CourseCard = ({ course }) => {
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    if (!course) return null;

    const {
        title,
        code,
        shortDescription,
        description,
        duration,
        fee,
        discountFee,
        level = "Beginner",
        category = "Computer Applications",
        badge,
        syllabus = [],
        features = [],
        rating = 4.8,
        enrolledCount = 120,
    } = course;

    // Level badge color
    const getLevelBadgeVariant = (lvl) => {
        switch (lvl?.toLowerCase()) {
            case "beginner":
                return "success";
            case "intermediate":
                return "primary";
            case "advanced":
                return "purple";
            default:
                return "secondary";
        }
    };

    return (
        <>
            <Card hoverable={true} className="flex flex-col h-full overflow-hidden p-0 border border-slate-200/80 bg-white">
                {/* Course Header Banner */}
                <div className="relative p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-md border border-blue-700/50">
                            {code}
                        </span>
                        {badge && (
                            <Badge variant="warning" size="sm">
                                {badge}
                            </Badge>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug relative z-10 min-h-[50px]">
                        {title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300 relative z-10 pt-2 border-t border-slate-700/60">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            {duration}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {rating}
                        </span>
                    </div>
                </div>

                {/* Course Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getLevelBadgeVariant(level)} size="sm">
                                {level}
                            </Badge>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{category}</span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {shortDescription || description}
                        </p>
                    </div>

                    {/* Features Snippet */}
                    {features && features.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            {features.slice(0, 2).map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                    <span className="truncate">{feat}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pricing & CTA Buttons */}
                    <div className="pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-baseline justify-between mb-4">
                            <div>
                                <span className="text-xs text-slate-400 block font-medium">Total Course Fee</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-extrabold text-slate-900">
                                        ₹{discountFee ? discountFee.toLocaleString("en-IN") : fee.toLocaleString("en-IN")}
                                    </span>
                                    {discountFee > 0 && discountFee < fee && (
                                        <span className="text-xs text-slate-400 line-through">
                                            ₹{fee.toLocaleString("en-IN")}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                Certification Incl.
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDetailsModalOpen(true)}
                                className="w-full text-xs"
                            >
                                View Details
                            </Button>
                            <Link to={`/signup?course=${encodeURIComponent(code)}`} className="w-full">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full text-xs"
                                    icon={ArrowRight}
                                    iconPosition="right"
                                >
                                    Enroll Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Course Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                title={title}
                subtitle={`Course Code: ${code} | Level: ${level} | Duration: ${duration}`}
                size="lg"
                footer={
                    <>
                        <Button variant="outline" size="md" onClick={() => setDetailsModalOpen(false)}>
                            Close
                        </Button>
                        <Link to={`/signup?course=${encodeURIComponent(code)}`}>
                            <Button
                                variant="primary"
                                size="md"
                                icon={ArrowRight}
                                iconPosition="right"
                                onClick={() => setDetailsModalOpen(false)}
                            >
                                Enroll in this Course
                            </Button>
                        </Link>
                    </>
                }
            >
                <div className="space-y-6">
                    {/* Overview */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-600" /> Course Overview
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Duration</span>
                            <p className="text-sm font-bold text-slate-900">{duration}</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Skill Level</span>
                            <p className="text-sm font-bold text-slate-900">{level}</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Fee</span>
                            <p className="text-sm font-bold text-blue-600">
                                ₹{discountFee ? discountFee.toLocaleString("en-IN") : fee.toLocaleString("en-IN")}
                            </p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Rating</span>
                            <p className="text-sm font-bold text-amber-600">★ {rating} / 5.0</p>
                        </div>
                    </div>

                    {/* Syllabus */}
                    {syllabus && syllabus.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" /> Complete Syllabus Modules
                            </h4>
                            <div className="space-y-2">
                                {syllabus.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-white border border-slate-200/80 rounded-xl text-sm text-slate-700 flex items-start gap-2.5"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {features && features.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" /> Key Benefits & Features
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                        <span>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default CourseCard;

