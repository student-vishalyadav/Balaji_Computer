const mongoose = require("mongoose");

const paymentItemSchema = new mongoose.Schema(
    {
        receiptNumber: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [1, "Payment amount must be greater than 0"],
        },
        paymentDate: {
            type: Date,
            default: Date.now,
        },
        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "card", "bank_transfer", "cheque"],
            default: "cash",
        },
        transactionRef: {
            type: String,
            default: "",
            trim: true,
        },
        receivedBy: {
            type: String,
            default: "Admin",
        },
        remarks: {
            type: String,
            default: "Fee installment",
            trim: true,
        },
    },
    { timestamps: true }
);

const feeSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true, // One comprehensive fee ledger per student
        },
        studentName: {
            type: String,
            required: true,
            trim: true,
        },
        studentCode: {
            type: String,
            default: "",
            trim: true,
        },
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        totalFee: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        netFee: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        remainingBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["paid", "partial", "pending", "overdue"],
            default: "pending",
        },
        dueDate: {
            type: Date,
        },
        payments: [paymentItemSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);

