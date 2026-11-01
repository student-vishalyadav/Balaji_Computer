import React, { useState, useEffect } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Layers,
    MapPin,
    CreditCard,
    DollarSign,
    ShieldCheck,
} from "lucide-react";
import { studentAPI } from "../../services/api";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";

export const AddStudent = ({ isOpen, onClose, onSuccess, courses = [], batches = [] }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "male",
        address: "",
        city: "",
        state: "State",
        pinCode: "",
        parentName: "",
        parentPhone: "",
        course: "",
        batchId: "",
        batchName: "",
        admissionDate: new Date().toISOString().slice(0, 10),
        totalCourseFee: 10000,
        discount: 0,
        initialPayment: 0,
        paymentMethod: "cash",
        transactionRef: "",
        isActive: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // When course is selected, auto-populate the fee
    const handleCourseChange = (e) => {
        const courseTitle = e.target.value;
        const selectedCourse = courses.find((c) => c.title === courseTitle || c.code === courseTitle);
        const fee = selectedCourse ? selectedCourse.fee : 10000;
        setFormData((prev) => ({
            ...prev,
            course: courseTitle,
            totalCourseFee: fee,
            discount: 0,
            initialPayment: Math.min(prev.initialPayment, fee),
        }));
    };

    // When batch is selected, track batchName
    const handleBatchChange = (e) => {
        const bId = e.target.value;
        const selectedBatch = batches.find((b) => b._id === bId);
        setFormData((prev) => ({
            ...prev,
            batchId: bId,
            batchName: selectedBatch ? selectedBatch.name : "Unassigned",
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // Fee calculations
    const netFee = Math.max(0, parseFloat(formData.totalCourseFee || 0) - parseFloat(formData.discount || 0));
    const remainingBalance = Math.max(0, netFee - parseFloat(formData.initialPayment || 0));

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
        if (!formData.course) newErrors.course = "Please select an academic course";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fill all required student information.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await studentAPI.create(formData);
            if (res?.success) {
                toast.success(res.msg);
                onSuccess();
            }
        } catch (err) {
            toast.error(err.message || "Failed to admit student");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Student Admission"
            subtitle="Register student profile, course allocation & initial fee transaction"
            size="xl"
            footer={
                <>
                    <Button variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Confirm & Admit Student
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
                {/* 1. Personal & Contact Information */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-blue-100 pb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> 1. Personal Information
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="Full Student Name"
                            name="fullName"
                            placeholder="e.g. Vikas Sharma"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                            required
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />
                        <Input
                            label="Mobile Number"
                            name="mobile"
                            type="tel"
                            placeholder="9876543210"
                            value={formData.mobile}
                            onChange={handleChange}
                            error={errors.mobile}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <Input
                            label="Admission Date"
                            name="admissionDate"
                            type="date"
                            value={formData.admissionDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Parent / Guardian Name"
                            name="parentName"
                            placeholder="Father/Mother name"
                            value={formData.parentName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Parent Contact Number"
                            name="parentPhone"
                            placeholder="Parent phone"
                            value={formData.parentPhone}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* 2. Residential Address */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-blue-100 pb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> 2. Residential Address
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <Input
                                label="Street Address"
                                name="address"
                                placeholder="House / Street / Colony"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                        <Input
                            label="City"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        <Input
                            label="PIN Code"
                            name="pinCode"
                            placeholder="000000"
                            value={formData.pinCode}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* 3. Academic Allocation */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-blue-100 pb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" /> 3. Course & Batch Allocation
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                Select Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleCourseChange}
                                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-blue-600 ${
                                    errors.course ? "border-red-400" : "border-slate-300"
                                }`}
                            >
                                <option value="">-- Choose Course --</option>
                                {courses.map((c) => (
                                    <option key={c.code} value={c.title}>
                                        {c.title} ({c.duration} - ₹{c.fee})
                                    </option>
                                ))}
                            </select>
                            {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                                Select Lab Batch
                            </label>
                            <select
                                name="batchId"
                                value={formData.batchId}
                                onChange={handleBatchChange}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-600"
                            >
                                <option value="">-- Assign Batch Later / Flexible --</option>
                                {batches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name} ({b.timing})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. Financial Record & Initial Payment */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> 4. Fee & Payment Ledger
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Total Course Fee (₹)
                            </label>
                            <input
                                type="number"
                                name="totalCourseFee"
                                value={formData.totalCourseFee}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Discount Granted (₹)
                            </label>
                            <input
                                type="number"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Initial Down Payment (₹)
                            </label>
                            <input
                                type="number"
                                name="initialPayment"
                                value={formData.initialPayment}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-emerald-600"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                                Payment Method
                            </label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                            >
                                <option value="cash">Cash Counter</option>
                                <option value="upi">UPI / QR Code</option>
                                <option value="card">Debit/Credit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    {/* Calculated Balances Summary Pill */}
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                        <div>
                            <span className="text-slate-500">Net Fee Payable:</span>
                            <span className="font-bold text-slate-900 ml-1.5 text-sm">
                                ₹{netFee.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-500">Remaining Balance:</span>
                            <span className="font-extrabold text-amber-700 ml-1.5 text-sm">
                                ₹{remainingBalance.toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default AddStudent;

