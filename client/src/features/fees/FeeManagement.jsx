import React, { useState, useEffect, useCallback, useRef } from "react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { feeAPI, studentAPI } from "../../services/api";
import {
    CreditCard,
    DollarSign,
    Search,
    Printer,
    Download,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpDown,
    RotateCcw,
    FileText,
    Receipt,
    Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

export const FeeManagement = () => {
    const [loading, setLoading] = useState(true);
    const [feeRecords, setFeeRecords] = useState([]);
    const [summary, setSummary] = useState({
        totalFees: 0,
        feesCollected: 0,
        pendingFees: 0,
        overdueCount: 0,
        paidCount: 0,
        partialCount: 0,
        pendingCount: 0,
    });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal States
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [allStudentsList, setAllStudentsList] = useState([]);

    // Form inputs for payment
    const [payForm, setPayForm] = useState({
        studentId: "",
        amount: "",
        paymentMethod: "cash",
        transactionRef: "",
        remarks: "Course Fee Installment",
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Fetch fee records
    const fetchFees = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const res = await feeAPI.getOverview({
                search,
                status: statusFilter,
                page,
                limit: 12,
            });
            if (res.success) {
                setFeeRecords(res.feeRecords || []);
                setSummary(res.summary || {});
                setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
            }
        } catch (error) {
            toast.error(error.message || "Failed to load fee records");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    // Fetch all active students for dropdown selection in "Add Payment"
    const fetchStudentsForDropdown = async () => {
        try {
            const res = await studentAPI.getAll({ limit: 200, status: "all" });
            if (res.success) {
                setAllStudentsList(res.students || []);
            }
        } catch {
            // non-blocking
        }
    };

    useEffect(() => {
        fetchFees(1);
    }, [fetchFees]);

    useEffect(() => {
        fetchStudentsForDropdown();
    }, []);

    // Open Record Payment for a specific student row
    const handleOpenPayment = (record) => {
        setSelectedStudentForPayment(record);
        setPayForm({
            studentId: record.studentId,
            amount: record.remainingBalance > 0 ? String(record.remainingBalance) : "",
            paymentMethod: "cash",
            transactionRef: "",
            remarks: `Fee Installment for ${record.courseName}`,
        });
        setPaymentModalOpen(true);
    };

    // Open generic record payment
    const handleOpenNewPayment = () => {
        setSelectedStudentForPayment(null);
        setPayForm({
            studentId: allStudentsList[0]?._id || "",
            amount: "",
            paymentMethod: "cash",
            transactionRef: "",
            remarks: "Course Fee Installment",
        });
        setPaymentModalOpen(true);
    };

    // Submit payment
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(payForm.amount);
        if (!payForm.studentId) {
            toast.error("Please select a student");
            return;
        }
        if (!amt || amt <= 0) {
            toast.error("Please enter a valid payment amount");
            return;
        }

        setSubmittingPayment(true);
        try {
            const res = await feeAPI.recordPayment({
                studentId: payForm.studentId,
                amount: amt,
                paymentMethod: payForm.paymentMethod,
                transactionRef: payForm.transactionRef,
                remarks: payForm.remarks,
            });

            if (res.success) {
                toast.success(res.msg || "Payment recorded successfully!");
                setPaymentModalOpen(false);
                fetchFees(pagination.page);

                // Fetch receipt details and display receipt modal immediately
                if (res.receiptNumber) {
                    handleViewReceipt(res.receiptNumber);
                }
            }
        } catch (error) {
            toast.error(error.message || "Failed to record payment");
        } finally {
            setSubmittingPayment(false);
        }
    };

    // View specific receipt
    const handleViewReceipt = async (receiptNumber) => {
        try {
            const res = await feeAPI.getReceipt(receiptNumber);
            if (res.success) {
                setSelectedReceipt(res.receipt);
                setReceiptModalOpen(true);
            }
        } catch (error) {
            toast.error("Receipt not found or unavailable");
        }
    };

    // Export fee records to CSV
    const handleExportCSV = () => {
        if (!feeRecords || feeRecords.length === 0) {
            toast.error("No fee records to export");
            return;
        }

        const headers = ["Student ID", "Student Name", "Course", "Net Fee (INR)", "Paid Amount (INR)", "Balance Due (INR)", "Status", "Payments Count"];
        const rows = feeRecords.map((r) => [
            `"${r.studentCode || ""}"`,
            `"${r.studentName}"`,
            `"${r.courseName}"`,
            r.netFee || 0,
            r.paidAmount || 0,
            r.remainingBalance || 0,
            r.status,
            r.payments?.length || 0,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Balaji_Computer_Fee_Report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Fee ledger exported as CSV");
    };

    // Print Receipt
    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Top Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard className="w-7 h-7 text-blue-600" />
                        Fee Payments & Financial Ledger
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Track student fee installments, balances, overdue dues, and issue official printable receipts
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleExportCSV} icon={Download}>
                        Export Ledger
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleOpenNewPayment} icon={Plus}>
                        Record Payment
                    </Button>
                </div>
            </div>

            {/* Financial Overview Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-l-4 border-l-blue-600 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Fees</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">
                                ₹{(summary.totalFees || 0).toLocaleString("en-IN")}
                            </h3>
                        </div>
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-emerald-600 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Collected</p>
                            <h3 className="text-2xl font-black text-emerald-600 mt-1">
                                ₹{(summary.feesCollected || 0).toLocaleString("en-IN")}
                            </h3>
                        </div>
                        <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-amber-500 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Balance</p>
                            <h3 className="text-2xl font-black text-amber-600 mt-1">
                                ₹{(summary.pendingFees || 0).toLocaleString("en-IN")}
                            </h3>
                        </div>
                        <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-red-500 bg-white shadow-xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overdue / Defaulters</p>
                            <h3 className="text-2xl font-black text-red-600 mt-1">
                                {summary.overdueCount || 0} Students
                            </h3>
                        </div>
                        <div className="w-11 h-11 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <Card className="p-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by student name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                        {[
                            { key: "all", label: "All Records" },
                            { key: "paid", label: "Fully Paid" },
                            { key: "partial", label: "Partial" },
                            { key: "pending", label: "Pending" },
                            { key: "overdue", label: "Overdue" },
                        ].map((chip) => (
                            <button
                                key={chip.key}
                                onClick={() => setStatusFilter(chip.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    statusFilter === chip.key
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Fee Records Table */}
            <Card className="overflow-hidden bg-white shadow-xs">
                {loading ? (
                    <div className="py-20 text-center space-y-3">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-500 font-medium">Loading financial records...</p>
                    </div>
                ) : feeRecords.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                        <h4 className="text-base font-bold text-slate-800">No Fee Records Found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            No students match the selected fee status or search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4">Course</th>
                                    <th className="py-3 px-4">Net Fee</th>
                                    <th className="py-3 px-4">Paid</th>
                                    <th className="py-3 px-4">Remaining Balance</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Installments</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {feeRecords.map((item) => {
                                    const latestPayment = item.payments && item.payments.length > 0
                                        ? item.payments[item.payments.length - 1]
                                        : null;

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900">{item.studentName}</div>
                                                <span className="text-[11px] text-slate-400 font-mono">
                                                    {item.studentCode || "No Roll"}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="text-slate-800 font-semibold">{item.courseName}</span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-800 font-bold">
                                                ₹{(item.netFee || 0).toLocaleString("en-IN")}
                                                {item.discount > 0 && (
                                                    <span className="block text-[10px] text-emerald-600 font-normal">
                                                        -₹{item.discount.toLocaleString("en-IN")} disc.
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600">
                                                ₹{(item.paidAmount || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold">
                                                {item.remainingBalance > 0 ? (
                                                    <span className="text-amber-600">
                                                        ₹{item.remainingBalance.toLocaleString("en-IN")}
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Clear
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge
                                                    variant={
                                                        item.status === "paid"
                                                            ? "success"
                                                            : item.status === "partial"
                                                            ? "primary"
                                                            : item.status === "overdue"
                                                            ? "danger"
                                                            : "warning"
                                                    }
                                                    size="sm"
                                                >
                                                    {item.status?.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {latestPayment ? (
                                                    <div>
                                                        <button
                                                            onClick={() => handleViewReceipt(latestPayment.receiptNumber)}
                                                            className="text-blue-600 hover:underline font-mono font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Receipt className="w-3 h-3" />
                                                            {latestPayment.receiptNumber}
                                                        </button>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            {new Date(latestPayment.paymentDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">0 paid</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={() => handleOpenPayment(item)}
                                                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                        + Installment
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing page {pagination.page} of {pagination.pages} ({pagination.total} records)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={pagination.page <= 1}
                                onClick={() => fetchFees(pagination.page - 1)}
                                className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                            >
                                Prev
                            </button>
                            <button
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => fetchFees(pagination.page + 1)}
                                className="px-3 py-1.5 bg-slate-100 rounded-lg disabled:opacity-40 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* MODAL 1: RECORD PAYMENT / INSTALLMENT */}
            <Modal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                title="Record Fee Payment"
                subtitle="Generate official institute receipt and credit student account"
                size="md"
            >
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Student selector if not preselected */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Student *
                        </label>
                        {selectedStudentForPayment ? (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <span className="font-bold text-slate-900 block text-sm">
                                    {selectedStudentForPayment.studentName}
                                </span>
                                <span className="text-slate-500">
                                    {selectedStudentForPayment.courseName} • Due Balance: ₹
                                    {(selectedStudentForPayment.remainingBalance || 0).toLocaleString("en-IN")}
                                </span>
                            </div>
                        ) : (
                            <select
                                value={payForm.studentId}
                                onChange={(e) => setPayForm({ ...payForm, studentId: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                required
                            >
                                <option value="">Select Student...</option>
                                {allStudentsList.map((st) => (
                                    <option key={st._id} value={st._id}>
                                        {st.fullName} ({st.studentId || "No ID"}) — {st.course || "Course"} (Due: ₹{st.remainingBalance || 0})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Amount & Method */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={payForm.amount}
                                onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                min="1"
                                step="any"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                Payment Method *
                            </label>
                            <select
                                value={payForm.paymentMethod}
                                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            >
                                <option value="cash">Cash Counter</option>
                                <option value="upi">UPI / QR Code</option>
                                <option value="card">Debit / Credit Card</option>
                                <option value="netbanking">Net Banking (IMPS/NEFT)</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    {/* Transaction Reference */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Transaction Reference / UTR / Cheque No.
                        </label>
                        <input
                            type="text"
                            placeholder="Optional transaction reference"
                            value={payForm.transactionRef}
                            onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Remarks / Notes
                        </label>
                        <input
                            type="text"
                            placeholder="Installment 1 / Final Settlement / etc."
                            value={payForm.remarks}
                            onChange={(e) => setPayForm({ ...payForm, remarks: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                        <Button variant="ghost" size="sm" type="button" onClick={() => setPaymentModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" loading={submittingPayment}>
                            Submit & Print Receipt
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: PRINTABLE OFFICIAL FEE RECEIPT */}
            <Modal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                title="Official Fee Receipt"
                subtitle="BALAJI COMPUTER • Learn Today, Lead Tomorrow"
                size="lg"
            >
                {selectedReceipt && (
                    <div className="space-y-6">
                        {/* Printable container */}
                        <div
                            id="printable-receipt"
                            className="p-6 bg-white border border-slate-300 rounded-2xl shadow-xs space-y-6 text-slate-900 font-sans"
                        >
                            {/* Receipt Top Header */}
                            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight text-blue-600">BALAJI COMPUTER</h1>
                                    <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase mt-0.5">
                                        Premier Computer Education & Technical Training
                                    </p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Near Main Market, Coaching Center Hub, Main Road • Phone: +91 98765 43210
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black tracking-wider uppercase rounded-md">
                                        FEE RECEIPT
                                    </div>
                                    <div className="mt-2 text-xs font-mono font-bold text-slate-800">
                                        #{selectedReceipt.receiptNumber}
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                        Date: {new Date(selectedReceipt.date).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Student & Course Details */}
                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div>
                                    <p className="text-slate-500">Student Name:</p>
                                    <p className="font-bold text-slate-900 text-sm">{selectedReceipt.studentName}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Roll / Student ID: <span className="font-mono font-bold text-slate-800">{selectedReceipt.studentCode || "N/A"}</span>
                                    </p>
                                    {selectedReceipt.studentContact && (
                                        <p className="text-[11px] text-slate-500">Mobile: {selectedReceipt.studentContact}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-slate-500">Enrolled Program:</p>
                                    <p className="font-bold text-slate-900 text-sm">{selectedReceipt.courseName}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Payment Method: <span className="font-bold uppercase text-slate-800">{selectedReceipt.paymentMethod}</span>
                                    </p>
                                    {selectedReceipt.transactionRef && (
                                        <p className="text-[11px] text-slate-500">
                                            Txn Ref: <span className="font-mono">{selectedReceipt.transactionRef}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Breakdown Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-3">Description</th>
                                            <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="py-2.5 px-3">
                                                <span className="font-semibold">{selectedReceipt.remarks || "Course Fee Installment"}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-black text-sm text-slate-900">
                                                ₹{(selectedReceipt.amount || 0).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Fee Ledger Summary */}
                            <div className="flex justify-between items-end pt-2 text-xs">
                                <div className="space-y-1 text-[11px] text-slate-500">
                                    <p>• Net Course Fee: ₹{(selectedReceipt.netFee || 0).toLocaleString("en-IN")}</p>
                                    <p>• Total Paid Till Date: ₹{(selectedReceipt.totalPaidToDate || 0).toLocaleString("en-IN")}</p>
                                    <p className="font-bold text-slate-800">
                                        • Remaining Due: ₹{(selectedReceipt.remainingBalance || 0).toLocaleString("en-IN")}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="w-36 h-12 border-b border-dashed border-slate-400 mb-1" />
                                    <p className="text-[11px] font-bold text-slate-700">Authorized Signature</p>
                                    <p className="text-[10px] text-slate-400">Balaji Computer Cashier</p>
                                </div>
                            </div>

                            <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
                                This is a computer-verified institute document. Fees once paid are non-refundable.
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" size="sm" onClick={() => setReceiptModalOpen(false)}>
                                Close
                            </Button>
                            <Button variant="primary" size="sm" onClick={handlePrintReceipt} icon={Printer}>
                                Print Receipt
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FeeManagement;