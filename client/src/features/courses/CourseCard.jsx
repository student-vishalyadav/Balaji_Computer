import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Clock,
    Award,
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Star,
    Layers,
    Send,
    AlertCircle,
    Info,
    Calendar,
    ShieldCheck,
    XCircle,
    User,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../hooks/useAuth";
import { enrollmentAPI } from "../../services/api";
import toast from "react-hot-toast";

export const CourseCard = ({ course }) => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const [enrollmentInfo, setEnrollmentInfo] = useState(null);
    const [studentNotes, setStudentNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!course) return null;

    const {
        _id: courseId,
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

    // Check student's current enrollment status for this course
    const checkStatus = async () => {
        if (isAuthenticated && user?.role === "student" && courseId) {
            try {
                const res = await enrollmentAPI.getStatus(courseId);
                if (res?.success) {
                    setEnrollmentInfo(res);
                }
            } catch (err) {
                // Silently ignore if offline or unauthenticated
            }
        }
    };

    useEffect(() => {
        checkStatus();
    }, [isAuthenticated, user, courseId]);

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

    // Handle Click on "Enroll Now"
    const handleEnrollClick = () => {
        if (!isAuthenticated) {
            toast("Please log in to your student account or create a new account to enroll.", {
                icon: "🔐",
            });
            navigate(`/login?redirect=/courses`);
            return;
        }

        if (user.role === "admin") {
            toast.error("Administrators cannot enroll as students. Please use Admin Panel to manage enrollments.");
            return;
        }

        if (enrollmentInfo?.isEnrolled) {
            navigate("/student/dashboard");
            return;
        }

        if (enrollmentInfo?.status === "PENDING" || enrollmentInfo?.status === "REJECTED") {
            setStatusModalOpen(true);
            return;
        }

        setStudentNotes("");
        setEnrollmentModalOpen(true);
    };

    // Submit Enrollment Request
    const handleSubmitEnrollment = async (e) => {
        e?.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await enrollmentAPI.request({
                courseId,
                notes: studentNotes,
            });

            if (res?.success) {
                toast.success(
                    "Your enrollment request has been submitted successfully. Please wait for admin approval.",
                    { duration: 5000 }
                );
                setEnrollmentModalOpen(false);
                setDetailsModalOpen(false);
                setEnrollmentInfo({
                    success: true,
                    status: "PENDING",
                    isEnrolled: false,
                    request: res.request,
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || err.message || "Failed to submit enrollment request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const finalFee = discountFee > 0 ? discountFee : fee;

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

                            {/* Active or Pending Status Badges */}
                            {enrollmentInfo?.isEnrolled && (
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Enrolled
                                </span>
                            )}
                            {enrollmentInfo?.status === "PENDING" && (
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                                    Pending Approval
                                </span>
                            )}
                            {enrollmentInfo?.status === "REJECTED" && (
                                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                    Rejected
                                </span>
                            )}
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
                                        ₹{finalFee.toLocaleString("en-IN")}
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

                            {enrollmentInfo?.isEnrolled ? (
                                <Link to="/student/dashboard" className="w-full">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="w-full text-xs bg-emerald-600 hover:bg-emerald-700"
                                        icon={CheckCircle2}
                                    >
                                        My Dashboard
                                    </Button>
                                </Link>
                            ) : enrollmentInfo?.status === "PENDING" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStatusModalOpen(true)}
                                    className="w-full text-xs text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100 font-semibold"
                                    icon={Clock}
                                >
                                    Approval Pending
                                </Button>
                            ) : enrollmentInfo?.status === "REJECTED" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStatusModalOpen(true)}
                                    className="w-full text-xs text-red-700 bg-red-50 border-red-300 hover:bg-red-100 font-semibold"
                                    icon={XCircle}
                                >
                                    View Decision
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleEnrollClick}
                                    className="w-full text-xs"
                                    icon={ArrowRight}
                                    iconPosition="right"
                                >
                                    Enroll Now
                                </Button>
                            )}
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
                        {enrollmentInfo?.isEnrolled ? (
                            <Link to="/student/dashboard" onClick={() => setDetailsModalOpen(false)}>
                                <Button variant="primary" size="md" icon={CheckCircle2} className="bg-emerald-600">
                                    Access Dashboard
                                </Button>
                            </Link>
                        ) : enrollmentInfo?.status === "PENDING" ? (
                            <Button
                                variant="outline"
                                size="md"
                                onClick={() => {
                                    setDetailsModalOpen(false);
                                    setStatusModalOpen(true);
                                }}
                                className="text-amber-700 border-amber-300 bg-amber-50"
                                icon={Clock}
                            >
                                View Pending Status
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                size="md"
                                icon={ArrowRight}
                                iconPosition="right"
                                onClick={() => {
                                    setDetailsModalOpen(false);
                                    handleEnrollClick();
                                }}
                            >
                                Enroll in this Course
                            </Button>
                        )}
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
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{duration}</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Skill Level</span>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{level}</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Category</span>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{category}</p>
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Certification</span>
                            <p className="text-sm font-bold text-emerald-600 mt-0.5">Government Recognized</p>
                        </div>
                    </div>

                    {/* Syllabus */}
                    {syllabus && syllabus.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" /> Curriculum & Syllabus Topics
                            </h4>
                            <div className="space-y-2">
                                {syllabus.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700"
                                    >
                                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Official Student Course Enrollment Request Modal */}
            <Modal
                isOpen={enrollmentModalOpen}
                onClose={() => setEnrollmentModalOpen(false)}
                title="Course Enrollment Application"
                subtitle={`Balaji Computer Institute • Application for ${code}`}
                size="md"
                footer={
                    <>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={() => setEnrollmentModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleSubmitEnrollment}
                            loading={isSubmitting}
                            icon={Send}
                            iconPosition="right"
                        >
                            Submit Enrollment Request
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmitEnrollment} className="space-y-4 text-xs sm:text-sm">
                    {/* Notice Callout */}
                    <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-blue-900">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed">
                            <span className="font-bold block text-blue-950 mb-0.5">
                                Administrator-Controlled Course Assignment Policy
                            </span>
                            Submitting this request alerts the institute administration. An administrator will review your
                            application, assign your lab batch, class timing, and certified instructor before granting
                            full student dashboard access.
                        </div>
                    </div>

                    {/* Student Verification Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Student Applicant Information
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="text-slate-500 block">Name:</span>
                                <span className="font-bold text-slate-800">{user?.fullName || user?.username}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Student ID:</span>
                                <span className="font-bold text-blue-600">{user?.studentId || "Assigned on approval"}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Email:</span>
                                <span className="font-medium text-slate-800 truncate block">{user?.email}</span>
                            </div>
                            <div>
                                <span className="text-slate-500 block">Phone:</span>
                                <span className="font-medium text-slate-800">{user?.mobile || "Provided in profile"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Course Summary Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Requested Curriculum
                        </span>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                                <p className="text-xs text-slate-500">Program Code: {code} • Duration: {duration}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-900">₹{finalFee.toLocaleString("en-IN")}</span>
                                <span className="text-[10px] text-slate-400 block">Tuition & Lab Fee</span>
                            </div>
                        </div>
                    </div>

                    {/* Optional Student Remarks */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Additional Notes / Preferred Timing (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={studentNotes}
                            onChange={(e) => setStudentNotes(e.target.value)}
                            placeholder="e.g. Preferred morning batch (10 AM - 12 PM), or specific career goals with this certification."
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                        />
                    </div>
                </form>
            </Modal>

            {/* Request Status & Decision Modal */}
            <Modal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                title="Enrollment Request Status"
                subtitle={`Track approval status for ${title}`}
                size="md"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-500">
                            Status ID: {enrollmentInfo?.request?._id || "Active"}
                        </span>
                        <div className="flex gap-2">
                            {enrollmentInfo?.status === "REJECTED" && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        setStatusModalOpen(false);
                                        setEnrollmentModalOpen(true);
                                    }}
                                >
                                    Re-Submit Application
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Status Banner */}
                    <div
                        className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                            enrollmentInfo?.status === "PENDING"
                                ? "bg-amber-50 border-amber-200 text-amber-900"
                                : enrollmentInfo?.status === "REJECTED"
                                ? "bg-red-50 border-red-200 text-red-900"
                                : "bg-emerald-50 border-emerald-200 text-emerald-900"
                        }`}
                    >
                        {enrollmentInfo?.status === "PENDING" ? (
                            <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                        ) : enrollmentInfo?.status === "REJECTED" ? (
                            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                        )}

                        <div className="space-y-1">
                            <h4 className="font-bold text-sm">
                                {enrollmentInfo?.status === "PENDING"
                                    ? "Application Under Review"
                                    : enrollmentInfo?.status === "REJECTED"
                                    ? "Application Rejected by Administration"
                                    : "Enrollment Approved!"}
                            </h4>
                            <p className="text-xs leading-relaxed">
                                {enrollmentInfo?.status === "PENDING"
                                    ? "Your enrollment request has been submitted and is currently being processed by institute administrators. You will receive an instant notification once your batch, timing, and mentor are assigned."
                                    : enrollmentInfo?.status === "REJECTED"
                                    ? "The administration has reviewed and rejected this enrollment request. Please review the reason below."
                                    : "Your enrollment request is approved. You can access your assigned class dashboard immediately."}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Metadata Grid */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Requested Course:</span>
                            <span className="font-bold text-slate-800">{title} ({code})</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Request Date:</span>
                            <span className="font-medium text-slate-800">
                                {enrollmentInfo?.request?.requestDate
                                    ? new Date(enrollmentInfo.request.requestDate).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "Recent"}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                            <span className="text-slate-500">Current Status:</span>
                            <Badge
                                variant={
                                    enrollmentInfo?.status === "PENDING"
                                        ? "warning"
                                        : enrollmentInfo?.status === "REJECTED"
                                        ? "danger"
                                        : "success"
                                }
                                size="sm"
                            >
                                {enrollmentInfo?.status || "PENDING"}
                            </Badge>
                        </div>
                        {enrollmentInfo?.request?.rejectionReason && (
                            <div className="pt-2 text-red-700 bg-red-100/60 p-2.5 rounded-xl border border-red-200">
                                <span className="font-bold block mb-0.5">Admin Rejection Reason:</span>
                                <span>{enrollmentInfo.request.rejectionReason}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default CourseCard;
