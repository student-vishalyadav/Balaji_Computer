import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Users,
    BookOpen,
    Award,
    CheckCircle2,
    GraduationCap,
    Monitor,
    Sparkles,
    ShieldCheck,
    Clock,
    Star,
    ChevronLeft,
    ChevronRight,
    Compass,
    TrendingUp,
    PhoneCall,
    Quote,
} from "lucide-react";
import { instituteAPI } from "../services/api";
import CourseList from "../features/courses/CourseList";
import { StatCardSkeleton } from "../components/common/Skeleton";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

export const Home = () => {
    // Dynamic Statistics State
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);

    // Dynamic Testimonials State
    const [testimonials, setTestimonials] = useState([]);
    const [loadingTestimonials, setLoadingTestimonials] = useState(true);
    const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

    // Fetch Stats and Testimonials from Backend API
    useEffect(() => {
        const fetchHomeData = async () => {
            // Stats
            try {
                const statsRes = await instituteAPI.getStats();
                if (statsRes?.success && statsRes.stats) {
                    setStats(statsRes.stats);
                }
            } catch (err) {
                console.warn("Using fallback stats:", err.message);
                // Fallback sensible values
                setStats({
                    totalStudents: "3,250+",
                    availableCourses: "12+",
                    expertFaculty: "18+",
                    successfulStudents: "2,900+",
                });
            } finally {
                setLoadingStats(false);
            }

            // Testimonials
            try {
                const testRes = await instituteAPI.getTestimonials();
                if (testRes?.success && testRes.testimonials) {
                    setTestimonials(testRes.testimonials);
                }
            } catch (err) {
                console.warn("Using fallback testimonials:", err.message);
            } finally {
                setLoadingTestimonials(false);
            }
        };

        fetchHomeData();
    }, []);

    // Auto-advance testimonial slider every 6 seconds
    useEffect(() => {
        if (!testimonials.length) return;
        const interval = setInterval(() => {
            setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextTestimonial = () => {
        setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <div className="space-y-20 sm:space-y-28 overflow-hidden">
            {/* =========================================================================
                SECTION B: HERO SECTION
               ========================================================================= */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
                {/* Decorative Background Orbs & Gradients */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/10 to-amber-300/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Hero Text Content */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                            {/* Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-semibold tracking-wide">
                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                <span>Govt. Syllabus Aligned • 14+ Years of Trust</span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                                Build Your Future With{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                                    Practical Computer
                                </span>{" "}
                                Education.
                            </h1>

                            {/* Description */}
                            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                                Learn industry-relevant computer skills, improve your technical knowledge, and prepare yourself for a successful career with Balaji Computer.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                                <Link to="/courses" className="w-full sm:w-auto">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full sm:w-auto shadow-lg shadow-blue-500/25"
                                        icon={ArrowRight}
                                        iconPosition="right"
                                    >
                                        Explore Courses
                                    </Button>
                                </Link>
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full sm:w-auto border-slate-300 hover:border-slate-400"
                                        icon={GraduationCap}
                                    >
                                        Join Our Institute
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-900">100%</p>
                                    <p className="text-xs text-slate-500 font-medium">Hands-on Practical Labs</p>
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-900">96.5%</p>
                                    <p className="text-xs text-slate-500 font-medium">Certification Success</p>
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-bold text-slate-900">4.9 ★</p>
                                    <p className="text-xs text-slate-500 font-medium">Student Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual Card / Illustration */}
                        <div className="lg:col-span-5 relative">
                            {/* Floating Card Design */}
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Back Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl transform rotate-2 scale-105 opacity-15 blur-lg" />

                                {/* Main Feature Card */}
                                <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                                                <Monitor className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">Balaji Computer Lab</h3>
                                                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Admissions Open for 2026 Batches
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="warning" size="sm">
                                            Trending
                                        </Badge>
                                    </div>

                                    {/* Highlights list */}
                                    <div className="space-y-3">
                                        {[
                                            { title: "ADCA & DCA Diplomas", desc: "Recognized certification & MS Office" },
                                            { title: "Tally Prime with GST", desc: "Real accounting bills & inventory practice" },
                                            { title: "Full Stack Coding & Python", desc: "Real software projects & web applications" },
                                            { title: "Typing Lab Practice", desc: "Hindi & English typing speed master class" },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl transition-colors border border-slate-100 flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{item.title}</p>
                                                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Direct registration callout */}
                                    <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-blue-200">Limited Lab Seats</p>
                                            <p className="text-sm font-bold">Book Your Free Demo Class</p>
                                        </div>
                                        <Link to="/signup">
                                            <button className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">
                                                Enroll Free
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION C: DYNAMIC STATISTICS SECTION
               ========================================================================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <Badge variant="primary" size="sm" className="mb-2">
                        Institute Milestones
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        Numbers That Reflect Our Academic Excellence
                    </h2>
                </div>

                {loadingStats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <StatCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Stat 1: Total Students */}
                        <Card hoverable={true} className="flex items-center gap-5 p-6 border-slate-200">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                                <Users className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {stats?.totalStudents || "3,250+"}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                    Total Enrolled Students
                                </p>
                            </div>
                        </Card>

                        {/* Stat 2: Available Courses */}
                        <Card hoverable={true} className="flex items-center gap-5 p-6 border-slate-200">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {stats?.availableCourses || "12+"}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                    Industry-Ready Courses
                                </p>
                            </div>
                        </Card>

                        {/* Stat 3: Expert Faculty */}
                        <Card hoverable={true} className="flex items-center gap-5 p-6 border-slate-200">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {stats?.expertFaculty || "18+"}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                    Expert Lab Instructors
                                </p>
                            </div>
                        </Card>

                        {/* Stat 4: Successful Students */}
                        <Card hoverable={true} className="flex items-center gap-5 p-6 border-slate-200">
                            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    {stats?.successfulStudents || "2,900+"}
                                </p>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                                    Certified & Employed Alumni
                                </p>
                            </div>
                        </Card>
                    </div>
                )}
            </section>

            {/* =========================================================================
                SECTION D: ABOUT SECTION (Why Choose Balaji Computer)
               ========================================================================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
                    <Badge variant="primary" size="md">
                        Our Core Strengths
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Why Choose Balaji Computer?
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        We blend theoretical fundamentals with daily hands-on laboratory exercises so every student gains genuine confidence in operating modern software.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Experienced Faculty */}
                    <Card
                        hoverable={true}
                        className="p-7 space-y-4 border-slate-200/80 bg-white group hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            1. Experienced Faculty
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Learn from dedicated, certified IT professionals with 8 to 14+ years of teaching and corporate technical experience.
                        </p>
                    </Card>

                    {/* Card 2: Practical Learning */}
                    <Card
                        hoverable={true}
                        className="p-7 space-y-4 border-slate-200/80 bg-white group hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-slate-950 flex items-center justify-center transition-all duration-300 shadow-xs">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            2. Practical Learning
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Individual computer terminals for each student with daily 2-hour lab sessions, live accounting bills, and coding drills.
                        </p>
                    </Card>

                    {/* Card 3: Affordable Education */}
                    <Card
                        hoverable={true}
                        className="p-7 space-y-4 border-slate-200/80 bg-white group hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            3. Affordable Education
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Transparent, pocket-friendly fees with flexible monthly installment options so financial constraints never stop your education.
                        </p>
                    </Card>

                    {/* Card 4: Career-Oriented Courses */}
                    <Card
                        hoverable={true}
                        className="p-7 space-y-4 border-slate-200/80 bg-white group hover:border-blue-300"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 group-hover:bg-purple-600 text-purple-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                            4. Career-Oriented Courses
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Programs designed around actual market demands, including government job typing preparation and software development portfolios.
                        </p>
                    </Card>
                </div>
            </section>

            {/* =========================================================================
                SECTION E: POPULAR COURSES SECTION (Dynamic Backend Integration)
               ========================================================================= */}
            <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div className="space-y-2">
                        <Badge variant="primary" size="sm">
                            Featured Curriculum
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Explore Our Popular Courses
                        </h2>
                        <p className="text-slate-600 text-sm max-w-xl">
                            Select from our government-certified diplomas, accounting tools, and software programming certifications.
                        </p>
                    </div>
                    <Link to="/courses">
                        <Button variant="outline" size="md" icon={ArrowRight} iconPosition="right">
                            View All Courses
                        </Button>
                    </Link>
                </div>

                {/* Course List with backend API integration */}
                <CourseList limit={6} showSearch={false} popularOnly={false} />
            </section>

            {/* =========================================================================
                SECTION F: WHY LEARN WITH US
               ========================================================================= */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
                <div className="max-w-6xl mx-auto px-6 sm:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6 space-y-6">
                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold uppercase tracking-wider">
                                Training Methodology
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                                Complete Practical Exposure For Real-World Job Readiness
                            </h2>
                            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                At Balaji Computer, we do not believe in passive lecture-only sessions. Every student spends at least 60% of their course duration sitting in front of high-performance lab workstations, building real projects.
                            </p>

                            <div className="space-y-4 pt-2">
                                {[
                                    { title: "Practical Computer Training", desc: "Hands-on practice on modern Windows OS, MS Office 365, and Tally Prime." },
                                    { title: "Real-World Projects", desc: "Prepare balance sheets, GST invoices, marketing banners, and responsive websites." },
                                    { title: "Experienced Instructors", desc: "Direct one-on-one doubt resolution during lab sessions." },
                                    { title: "Flexible Batch Timings", desc: "Morning, afternoon, and evening slots available for college students and working professionals." },
                                    { title: "Comprehensive Student Support", desc: "Free typing lab access, mock test series, and job placement assistance." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3.5">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-slate-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Lab Callout */}
                        <div className="lg:col-span-6">
                            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-semibold text-slate-300">Daily Batch Timings</span>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-semibold">Batches Active</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                        <p className="text-slate-400 font-medium">Batch 1 (Morning)</p>
                                        <p className="text-sm font-bold text-white mt-1">08:00 AM - 10:00 AM</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                        <p className="text-slate-400 font-medium">Batch 2 (Midday)</p>
                                        <p className="text-sm font-bold text-white mt-1">10:00 AM - 12:00 PM</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                        <p className="text-slate-400 font-medium">Batch 3 (Afternoon)</p>
                                        <p className="text-sm font-bold text-white mt-1">02:00 PM - 04:00 PM</p>
                                    </div>
                                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                                        <p className="text-slate-400 font-medium">Batch 4 (Evening)</p>
                                        <p className="text-sm font-bold text-white mt-1">04:00 PM - 06:00 PM</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-xs text-blue-200">
                                    💡 <strong>Pro Tip:</strong> Weekend fast-track sessions and typing lab practice hours are available on Saturday afternoon for enrolled students.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION G: STUDENT TESTIMONIALS SLIDER
               ========================================================================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div className="space-y-2">
                        <Badge variant="primary" size="sm">
                            Student Success Stories
                        </Badge>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            What Our Students Say About Us
                        </h2>
                        <p className="text-slate-600 text-sm max-w-xl">
                            Genuine student reviews from our recent graduates in IT, accounting, and development.
                        </p>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevTestimonial}
                            aria-label="Previous testimonial"
                            className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            aria-label="Next testimonial"
                            className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors cursor-pointer"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Testimonial Active Display */}
                {loadingTestimonials || testimonials.length === 0 ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse h-64" />
                ) : (
                    <div className="relative bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md">
                        <Quote className="w-12 h-12 text-blue-100 absolute top-6 right-8 pointer-events-none" />

                        {testimonials.map((item, idx) => {
                            if (idx !== activeTestimonialIdx) return null;
                            return (
                                <div key={item.id} className="space-y-6 animate-in fade-in duration-300">
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(item.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-amber-400" />
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-base sm:text-xl text-slate-800 leading-relaxed font-medium italic">
                                        "{item.review}"
                                    </p>

                                    {/* Student Identity */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                                            {item.name ? item.name[0] : "S"}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                                {item.name}
                                                <Badge variant="success" size="sm">
                                                    Verified Student
                                                </Badge>
                                            </h4>
                                            <p className="text-xs text-blue-600 font-semibold">{item.course}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Slider indicator dots */}
                        <div className="flex items-center justify-center gap-2 pt-8">
                            {testimonials.map((_, dotIdx) => (
                                <button
                                    key={dotIdx}
                                    onClick={() => setActiveTestimonialIdx(dotIdx)}
                                    className={`h-2 rounded-full transition-all cursor-pointer ${
                                        dotIdx === activeTestimonialIdx
                                            ? "w-8 bg-blue-600"
                                            : "w-2 bg-slate-200 hover:bg-slate-300"
                                    }`}
                                    aria-label={`Go to slide ${dotIdx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* =========================================================================
                SECTION H: CALL TO ACTION (CTA)
               ========================================================================= */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-14 text-white text-center shadow-xl">
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <span className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-blue-100">
                            Admissions Open • Flexible Batches Available
                        </span>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                            Start Your Computer Learning Journey Today!
                        </h2>

                        <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto leading-relaxed">
                            Take the first step toward high-demand digital skills and career certification. Enroll online or explore our complete syllabus modules.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button
                                    variant="accent"
                                    size="lg"
                                    className="w-full sm:w-auto shadow-md"
                                    icon={ArrowRight}
                                    iconPosition="right"
                                >
                                    Register Now
                                </Button>
                            </Link>
                            <Link to="/courses" className="w-full sm:w-auto">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20"
                                >
                                    Explore Courses
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

