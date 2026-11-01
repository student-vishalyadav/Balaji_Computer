import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Layers,
    CreditCard,
    Award,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Edit3,
    Save,
    X,
    Key,
    DollarSign,
} from "lucide-react";
import { studentAPI, feeAPI } from "../../services/api";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

export const StudentDetails = ({ isOpen, onClose, studentId, onUpdated }) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Record Payment quick modal inside Fee tab
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentRemarks, setPaymentRemarks] = useState("Fee Installment");

    useEffect(() => {
        if (!isOpen || !studentId) return;
        setIsEditing(false);
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const res = await studentAPI.getById(studentId);
                if (res?.success) {
                    setData(res);
                    setEditForm(res.student);
                }
            } catch (err) {
                toast.error("Failed to load student profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [isOpen, studentId]);

    if (!isOpen) return null;

    const handleSaveUpdates = async () => {
        setIsSaving(true);
        try {
            const res = await studentAPI.update(data.student._id, editForm);
            if (res?.success) {
                toast.success("Student profile updated successfully");
                setData((prev) => ({ ...prev, student: res.student }));
                setIsEditing(false);
                if (onUpdated) onUpdated();
            }
        } catch (err) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const amt = parseFloat(paymentAmount);
        if (!amt || amt <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        try {
            const res = await feeAPI.recordPayment({
                studentId: data.student._id,
                amount: amt,
                paymentMethod,
                remarks: paymentRemarks,
            });
            if (res?.success) {
                toast.success(res.msg);
                setPaymentModalOpen(false);
                setPaymentAmount("");
                // Refresh student details
                const updatedRes = await studentAPI.getById(studentId);
                setData(updatedRes);
                if (onUpdated) onUpdated();
            }
        } catch (err) {
            toast.error(err.message || "Payment recording failed");
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: User },
        { id: "personal", label: "Personal Info", icon: MapPin },
        { id: "course", label: "Course & Batch", icon: BookOpen },
        { id: "attendance", label: "Attendance", icon: Calendar },
        { id: "fees", label: "Fee Ledger", icon: CreditCard },
        { id: "exams", label: "Examinations", icon: Award },
        { id: "materials", label: "Study Materials", icon: FileText },
    ];

    const student = data?.student;
    const fees = data?.fees;
    const attendance = data?.attendance;
    const exams = data?.exams || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={student?.fullName || "Student Profile"}
            subtitle={`Student ID: ${student?.studentId || "BC-PENDING"} • Enrolled in ${student?.course || "Course"}`}
            size="xl"
            footer={
                <div className="flex items-center justify-between w-full">
                    <div>
                        {isEditing ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                            >
                                Cancel Edit
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                icon={Edit3}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleSaveUpdates}
                                loading={isSaving}
                                icon={Save}
                            >
                                Save Changes
                            </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={onClose}>
                            Close Window
                        </Button>
                    </div>
                </div>
            }
        >
            {isLoading ? (
                <div className="p-12 text-center text-slate-500 animate-pulse space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto" />
                    <p className="text-sm font-semibold">Loading student record and ledgers...</p>
                </div>
            ) : student ? (
                <div className="space-y-6">
                    {/* Header Bio Banner */}
                    <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
                                {student.fullName ? student.fullName[0].toUpperCase() : "S"}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">{student.fullName}</h3>
                                <p className="text-xs text-blue-300 font-mono">
                                    ID: {student.studentId} • {student.email}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Batch: {student.batchName || "Flexible Batch"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant={student.isActive ? "success" : "secondary"} size="md">
                                {student.isActive ? "Active Account" : "Inactive"}
                            </Badge>
                            <Badge
                                variant={
                                    student.feeStatus === "paid"
                                        ? "success"
                                        : student.feeStatus === "partial"
                                        ? "warning"
                                        : "danger"
                                }
                                size="md"
                            >
                                Fee: {student.feeStatus?.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    {/* Navigation Tabs Bar */}
                    <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-none text-xs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                        activeTab === tab.id
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB 1: OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="space-y-6 text-xs sm:text-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-slate-400 font-medium block">Total Course Fee</span>
                                    <p className="text-base font-extrabold text-slate-900 mt-1">
                                        ₹{(fees?.netFee || student.netFee || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <span className="text-emerald-700 font-medium block">Paid Amount</span>
                                    <p className="text-base font-extrabold text-emerald-700 mt-1">
                                        ₹{(fees?.paidAmount || student.paidAmount || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                                    <span className="text-amber-700 font-medium block">Balance Due</span>
                                    <p className="text-base font-extrabold text-amber-700 mt-1">
                                        ₹{(fees?.remainingBalance || student.remainingBalance || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                                    <span className="text-blue-700 font-medium block">Attendance Rate</span>
                                    <p className="text-base font-extrabold text-blue-700 mt-1">
                                        {attendance?.rate || "95.0%"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                <h4 className="font-bold text-slate-900 uppercase text-xs">Summary Details</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <p><strong className="text-slate-600">Mobile Phone:</strong> {student.mobile}</p>
                                    <p><strong className="text-slate-600">Email Address:</strong> {student.email}</p>
                                    <p><strong className="text-slate-600">Residential City:</strong> {student.city || "Not Provided"}</p>
                                    <p><strong className="text-slate-600">Admission Date:</strong> {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "-"}</p>
                                    <p><strong className="text-slate-600">Parent/Guardian:</strong> {student.parentName || "Not Provided"}</p>
                                    <p><strong className="text-slate-600">Parent Contact:</strong> {student.parentPhone || "Not Provided"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: PERSONAL INFORMATION (with Edit Support) */}
                    {activeTab === "personal" && (
                        <div className="space-y-4 text-xs sm:text-sm">
                            {isEditing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        value={editForm.fullName || ""}
                                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                    />
                                    <Input
                                        label="Mobile Number"
                                        value={editForm.mobile || ""}
                                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                    />
                                    <Input
                                        label="Parent / Guardian Name"
                                        value={editForm.parentName || ""}
                                        onChange={(e) => setEditForm({ ...editForm, parentName: e.target.value })}
                                    />
                                    <Input
                                        label="Parent Contact Phone"
                                        value={editForm.parentPhone || ""}
                                        onChange={(e) => setEditForm({ ...editForm, parentPhone: e.target.value })}
                                    />
                                    <Input
                                        label="Residential Address"
                                        value={editForm.address || ""}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    />
                                    <Input
                                        label="City"
                                        value={editForm.city || ""}
                                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 text-xs">
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Full Name</span>
                                        <span className="font-bold text-slate-900">{student.fullName}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Email Address</span>
                                        <span className="text-slate-800">{student.email}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Mobile Phone</span>
                                        <span className="text-slate-800">{student.mobile}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Gender</span>
                                        <span className="capitalize text-slate-800">{student.gender || "Not specified"}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Date of Birth</span>
                                        <span className="text-slate-800">{student.dob || "Not provided"}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Complete Address</span>
                                        <span className="text-slate-800">{student.address || "Not provided"}</span>
                                    </div>
                                    <div className="py-2.5 flex justify-between">
                                        <span className="text-slate-500 font-medium">Parent / Guardian</span>
                                        <span className="text-slate-800">{student.parentName || "Not provided"} ({student.parentPhone || "No Phone"})</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: COURSE & BATCH */}
                    {activeTab === "course" && (
                        <div className="space-y-4 text-xs sm:text-sm">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                                    <h4 className="font-bold text-slate-900">Enrolled Program</h4>
                                    <Badge variant="primary" size="sm">Active</Badge>
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <p><strong className="text-slate-600">Course Name:</strong> {student.course}</p>
                                    <p><strong className="text-slate-600">Assigned Batch:</strong> {student.batchName || "Flexible Batch"}</p>
                                    <p><strong className="text-slate-600">Admission Date:</strong> {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : "-"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ATTENDANCE HISTORY */}
                    {activeTab === "attendance" && (
                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-2.5 bg-slate-50 rounded-xl">
                                    <span className="text-slate-400 block">Total</span>
                                    <span className="font-bold text-slate-900 text-sm">{attendance?.totalClasses || 0}</span>
                                </div>
                                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                                    <span className="block">Present</span>
                                    <span className="font-bold text-sm">{attendance?.presentCount || 0}</span>
                                </div>
                                <div className="p-2.5 bg-red-50 rounded-xl text-red-700">
                                    <span className="block">Absent</span>
                                    <span className="font-bold text-sm">{attendance?.absentCount || 0}</span>
                                </div>
                                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                                    <span className="block">Late</span>
                                    <span className="font-bold text-sm">{attendance?.lateCount || 0}</span>
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                                {attendance?.history && attendance.history.length > 0 ? (
                                    attendance.history.map((h, i) => (
                                        <div key={i} className="p-2.5 flex justify-between items-center">
                                            <div>
                                                <span className="font-bold text-slate-800">{h.date}</span>
                                                <span className="text-slate-400 ml-2">({h.batch})</span>
                                            </div>
                                            <Badge
                                                variant={h.status === "present" ? "success" : h.status === "late" ? "warning" : "danger"}
                                                size="sm"
                                            >
                                                {h.status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-slate-400">No attendance history logged yet.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: FEE & PAYMENT LEDGER */}
                    {activeTab === "fees" && (
                        <div className="space-y-4 text-xs">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Fee Ledger & Payment Receipts</h4>
                                    <p className="text-slate-400">Total Due: ₹{(fees?.remainingBalance || 0).toLocaleString("en-IN")}</p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setPaymentModalOpen(true)}
                                    icon={DollarSign}
                                >
                                    Record Installment
                                </Button>
                            </div>

                            {/* Payment history list */}
                            <div className="space-y-2">
                                {fees?.payments && fees.payments.length > 0 ? (
                                    fees.payments.map((p, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                                        >
                                            <div>
                                                <span className="font-mono font-bold text-blue-600 block">
                                                    #{p.receiptNumber}
                                                </span>
                                                <span className="text-slate-500 text-[11px]">
                                                    {new Date(p.paymentDate).toLocaleDateString()} via {p.paymentMethod?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-extrabold text-emerald-600 text-sm block">
                                                    ₹{p.amount.toLocaleString("en-IN")}
                                                </span>
                                                <span className="text-[10px] text-slate-400">Received by {p.receivedBy}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                                        No payments recorded yet. Click "Record Installment" to add a fee installment.
                                    </p>
                                )}
                            </div>

                            {/* Record Payment Sub-modal */}
                            {paymentModalOpen && (
                                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                                    <h5 className="font-bold text-emerald-900">Record Fee Installment</h5>
                                    <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Amount (₹) *
                                            </label>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="e.g. 2000"
                                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Method
                                            </label>
                                            <select
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="upi">UPI / QR</option>
                                                <option value="card">Card</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                Remarks
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentRemarks}
                                                onChange={(e) => setPaymentRemarks(e.target.value)}
                                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                            />
                                        </div>
                                        <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
                                            <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="primary" size="sm">
                                                Confirm Payment
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 6: EXAMINATIONS RESULTS */}
                    {activeTab === "exams" && (
                        <div className="space-y-3 text-xs">
                            {exams && exams.length > 0 ? (
                                exams.map((ex, i) => (
                                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-slate-900">{ex.examTitle}</p>
                                            <span className="text-slate-500">{ex.courseName}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-slate-900 block">
                                                {ex.result?.marksObtained} / {ex.result?.totalMarks} ({ex.result?.percentage}%)
                                            </span>
                                            <Badge variant={ex.result?.status === "pass" ? "success" : "danger"} size="sm">
                                                {ex.result?.status?.toUpperCase()} (Grade {ex.result?.grade})
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl">
                                    No completed examinations on record for this student yet.
                                </p>
                            )}
                        </div>
                    )}

                    {/* TAB 7: STUDY MATERIALS */}
                    {activeTab === "materials" && (
                        <div className="space-y-2 text-xs">
                            <p className="text-slate-500 mb-2">Available course modules and practice notes for {student.course}:</p>
                            {[
                                { title: `${student.course} Standard Curriculum & Lab Manual`, size: "12.4 MB" },
                                { title: "Exam Question Bank & Practical Assignments", size: "4.8 MB" },
                                { title: "Typing Test Rules & Speed Benchmark Chart", size: "1.2 MB" },
                            ].map((m, i) => (
                                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-slate-800">{m.title}</span>
                                    </div>
                                    <Badge variant="secondary" size="sm">{m.size}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </Modal>
    );
};

export default StudentDetails;

