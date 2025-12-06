const express = require("express");
const router = express.Router();
const tx = require("../controllers/transactions.controller");
const auth = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/auth.middleware");


// Borrow and return do NOT require admin auth (students use them)
router.post("/borrow", tx.borrow);
router.post("/return", tx.return);

// Admin endpoints
router.get("/recent", auth.requireAdmin, tx.recent);
router.get("/active-codes", auth.requireAdmin, tx.activeCodes);

module.exports = router;
