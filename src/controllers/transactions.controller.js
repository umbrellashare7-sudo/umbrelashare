const Transaction = require("../models/Transaction");
const Umbrella = require("../models/Umbrella");
const { generate6DigitCode } = require("../utils/codeGenerator");

exports.borrow = async (req, res) => {
  try {
    const { umbrellaId, studentId, studentName, pickupLocation, code } =
      req.body;
    if (!umbrellaId || !studentId || !pickupLocation || !code)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // NEW: Validate admin-generated code
    if (umbrella.activeBorrowCode !== code)
      return res.status(400).json({ message: "Invalid borrow code" });

    // Must be available
    if (!umbrella.isAvailable)
      return res.status(400).json({ message: "Umbrella not available" });

    if (
      umbrella.activeBorrowCode !== code ||
      !umbrella.activeBorrowCodeExpiresAt ||
      umbrella.activeBorrowCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired borrow code" });
    }


    // Clear code
    umbrella.activeBorrowCode = null;

    const tx = await Transaction.create({
      umbrella: umbrella._id,
      umbrellaId,
      studentId,
      studentName,
      action: "BORROW",
      code,
      pickupLocation,
      status: "OPEN",
    });

    umbrella.isAvailable = false;
    umbrella.currentLocation = `with:${studentId}`;
    await umbrella.save();

    res.json({ message: "Borrow successful", txId: tx._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
  umbrella.activeBorrowCode = null;
  umbrella.activeBorrowCodeExpiresAt = null;

};


exports.return = async (req, res) => {
  try {
    const { umbrellaId, studentId, code, returnLocation } = req.body;

    if (!umbrellaId || !studentId || !code || !returnLocation)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // NEW: Validate admin return code
    if (umbrella.activeReturnCode !== code)
      return res.status(400).json({ message: "Invalid return code" });

    if (
      umbrella.activeReturnCode !== code ||
      !umbrella.activeReturnCodeExpiresAt ||
      umbrella.activeReturnCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired return code" });
    }


    // Close existing borrow
    const tx = await Transaction.findOne({
      umbrellaId,
      studentId,
      action: "BORROW",
      status: "OPEN",
    });

    if (!tx) return res.status(400).json({ message: "No open rental found" });

    tx.status = "COMPLETED";
    await tx.save();

    // Clear return code
    umbrella.activeReturnCode = null;
    umbrella.isAvailable = true;
    umbrella.currentLocation = returnLocation;
    await umbrella.save();

    res.json({ message: "Return successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
  umbrella.activeReturnCode = null;
  umbrella.activeReturnCodeExpiresAt = null;

};


exports.recent = async (req, res) => {
  try {
    // recent transactions - last 50
    const list = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.activeCodes = async (req, res) => {
  try {
    // active OPEN transactions (borrow) — show code so admin can display popup
    const open = await Transaction.find({ status: "OPEN" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(open);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
