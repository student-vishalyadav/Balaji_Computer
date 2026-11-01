const feeModel = require("../models/feeModel");
const userModel = require("../models/userModel");
const auditLogModel = require("../models/auditLogModel");

// Get Fees Overview and All Student Fee Records
const getFeesOverview = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 15 } = req.query;
        const query = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [{ studentName: regex }, { studentCode: regex }, { courseName: regex }];
        }

        // Summary Aggregations
        const summaryAgg = await feeModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalFeesExpected: { $sum: "$netFee" },
                    totalFeesCollected: { $sum: "$paidAmount" },
                    totalPendingFees: { $sum: "$remainingBalance" },
                },
            },
        ]);

        const overdueCount = await feeModel.countDocuments({ status: "overdue" });
        const paidCount = await feeModel.countDocuments({ status: "paid" });
        const partialCount = await feeModel.countDocuments({ status: "partial" });
        const pendingCount = await feeModel.countDocuments({ status: "pending" });

        const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
        const total = await feeModel.countDocuments(query);
        const feeRecords = await feeModel
            .find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            summary: {
                totalFees: summaryAgg[0]?.totalFeesExpected || 0,
                feesCollected: summaryAgg[0]?.totalFeesCollected || 0,
                pendingFees: summaryAgg[0]?.totalPendingFees || 0,
                overdueCount,
                paidCount,
                partialCount,
                pendingCount,
            },
            feeRecords,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)) || 1,
            },
        });
    } catch (error) {
        console.error("Error in getFeesOverview:", error);
        return res.status(500).json({ success: false, msg: "Failed to fetch fee records" });
    }
};

// Record New Payment / Installment
const recordPayment = async (req, res) => {
    try {
        const { studentId, amount, paymentMethod = "cash", transactionRef = "", remarks = "" } = req.body;

        const parsedAmount = parseFloat(amount);
        if (!studentId || !parsedAmount || parsedAmount <= 0) {
            return res.status(400).json({ success: false, msg: "Valid Student ID and payment amount are required" });
        }

        let feeLedger = await feeModel.findOne({ studentId });
        const student = await userModel.findById(studentId);

        if (!student) {
            return res.status(404).json({ success: false, msg: "Student not found" });
        }

        // If fee ledger doesn't exist yet, initialize it from student's course fee
        if (!feeLedger) {
            const totalFee = student.totalFee || 10000;
            const discount = student.discount || 0;
            const netFee = Math.max(0, totalFee - discount);
            feeLedger = new feeModel({
                studentId: student._id,
                studentName: student.fullName,
                studentCode: student.studentId || "",
                courseName: student.course || "Computer Course",
                totalFee,
                discount,
                netFee,
                paidAmount: 0,
                remainingBalance: netFee,
                status: "pending",
                payments: [],
            });
        }

        // Generate unique receipt number
        const receiptNumber = `BC-RCP-${Date.now().toString().slice(-6)}`;

        const newPayment = {
            receiptNumber,
            amount: parsedAmount,
            paymentDate: new Date(),
            paymentMethod,
            transactionRef: transactionRef.trim(),
            receivedBy: req.user?.fullName || "Admin",
            remarks: remarks.trim() || "Course Fee Installment",
        };

        feeLedger.payments.push(newPayment);
        feeLedger.paidAmount = (feeLedger.paidAmount || 0) + parsedAmount;
        feeLedger.remainingBalance = Math.max(0, feeLedger.netFee - feeLedger.paidAmount);

        if (feeLedger.paidAmount >= feeLedger.netFee && feeLedger.netFee > 0) {
            feeLedger.status = "paid";
        } else if (feeLedger.paidAmount > 0) {
            feeLedger.status = "partial";
        } else {
            feeLedger.status = "pending";
        }

        await feeLedger.save();

        // Sync with student user document
        student.paidAmount = feeLedger.paidAmount;
        student.remainingBalance = feeLedger.remainingBalance;
        student.feeStatus = feeLedger.status;
        await student.save();

        await auditLogModel.create({
            action: "RECORD_FEE_PAYMENT",
            performedBy: req.user?.fullName || "Admin",
            targetType: "Fee",
            targetId: String(feeLedger._id),
            details: `Recorded ₹${parsedAmount} payment for ${student.fullName} (Receipt: ${receiptNumber}, Method: ${paymentMethod})`,
            ipAddress: req.ip || "127.0.0.1",
        });

        return res.status(200).json({
            success: true,
            msg: `Payment of ₹${parsedAmount.toLocaleString("en-IN")} recorded successfully. Receipt #${receiptNumber}`,
            receiptNumber,
            payment: newPayment,
            feeRecord: feeLedger,
        });
    } catch (error) {
        console.error("Error in recordPayment:", error);
        return res.status(500).json({ success: false, msg: error.message || "Failed to record payment" });
    }
};

// Get Receipt Details by Receipt Number
const getReceiptDetails = async (req, res) => {
    try {
        const { receiptNumber } = req.params;

        const feeRecord = await feeModel.findOne({ "payments.receiptNumber": receiptNumber });
        if (!feeRecord) {
            return res.status(404).json({ success: false, msg: "Receipt not found" });
        }

        const payment = feeRecord.payments.find((p) => p.receiptNumber === receiptNumber);
        const student = await userModel.findById(feeRecord.studentId).select("email mobile address parentName");

        return res.status(200).json({
            success: true,
            receipt: {
                receiptNumber: payment.receiptNumber,
                date: payment.paymentDate,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                transactionRef: payment.transactionRef,
                receivedBy: payment.receivedBy,
                remarks: payment.remarks,
                studentName: feeRecord.studentName,
                studentCode: feeRecord.studentCode,
                courseName: feeRecord.courseName,
                totalFee: feeRecord.totalFee,
                discount: feeRecord.discount,
                netFee: feeRecord.netFee,
                totalPaidToDate: feeRecord.paidAmount,
                remainingBalance: feeRecord.remainingBalance,
                status: feeRecord.status,
                studentContact: student?.mobile || "",
                studentEmail: student?.email || "",
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, msg: "Failed to generate receipt" });
    }
};

module.exports = {
    getFeesOverview,
    recordPayment,
    getReceiptDetails,
};

