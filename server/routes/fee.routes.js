const express = require("express");
const router = express.Router();
const {
    getFeesOverview,
    recordPayment,
    getReceiptDetails,
} = require("../controllers/fee.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Receipt viewing (admin and student)
router.get("/receipt/:receiptNumber", verifyToken, getReceiptDetails);

// Admin-only fee ledger operations
router.use(verifyToken, authorizeRoles("admin"));

router.get("/overview", getFeesOverview);
router.post("/payment", recordPayment);

module.exports = router;
