const express = require("express");
const router = express.Router();

const tx = require("../controllers/transactions.controller");
const auth = require("../middleware/authUser.middleware");

// DEBUG OUTPUT — this will tell us what's wrong
console.log("Loaded TX controller:", tx);
console.log("Loaded AUTH middleware:", auth);

// Student routes
router.post("/borrow", auth.requireUser, tx.borrow);
router.post("/return", auth.requireUser, tx.return);

// Admin routes
router.get("/recent", auth.requireUser, auth.requireAdmin, tx.recent);
router.get(
  "/active-codes",
  auth.requireUser,
  auth.requireAdmin,
  tx.activeCodes
);


module.exports = router;
