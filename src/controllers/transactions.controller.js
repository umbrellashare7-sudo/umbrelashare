const Transaction = require("../models/Transaction");
const Umbrella = require("../models/Umbrella");
const Student = require("../models/student.model"); // if not imported



/* =====================================================
   BORROW
===================================================== */
exports.borrow = async (req, res) => {
  try {
    const umbrellaId = req.body.umbrellaId;
    const pickupLocation = req.body.pickupLocation;
    const code = req.body.code;

    const studentId = req.user.id;
    const studentName = req.user.name;

    if (!umbrellaId || !pickupLocation || !code)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // Validate borrow code
    if (
      umbrella.activeBorrowCode !== code ||
      !umbrella.activeBorrowCodeExpiresAt ||
      umbrella.activeBorrowCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired borrow code" });
    }

    if (!umbrella.isAvailable)
      return res.status(400).json({ message: "Umbrella not available" });

    // Clear code
    umbrella.activeBorrowCode = null;
    umbrella.activeBorrowCodeExpiresAt = null;
    umbrella.isAvailable = false;
    umbrella.currentLocation = `with:${studentName}`;
    await umbrella.save();

    // Create transaction
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

    // Update student record (SIMPLE, CLEAN)
    await Student.findByIdAndUpdate(studentId, {
      borrowedUmbrellaId: umbrellaId,
    });

    return res.json({ message: "Borrow successful", txId: tx._id });
  } catch (err) {
    console.error("Borrow error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   RETURN
===================================================== */
exports.return = async (req, res) => {
  try {
    const umbrellaId = req.body.umbrellaId;
    const returnLocation = req.body.returnLocation;
    const code = req.body.code;

    const studentId = req.user.id;

    if (!umbrellaId || !returnLocation || !code)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    console.log("RETURN DEBUG:", {
      umbrellaId,
      studentId,
      code,
      expectedCode: umbrella.activeReturnCode,
      expiresAt: umbrella.activeReturnCodeExpiresAt,
    });

    // Validate return code
    if (
      umbrella.activeReturnCode !== code ||
      !umbrella.activeReturnCodeExpiresAt ||
      umbrella.activeReturnCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired return code" });
    }

    // Find active transaction
    const tx = await Transaction.findOne({
      umbrellaId,
      studentId,
      action: "BORROW",
      status: "OPEN",
    });

    if (!tx) return res.status(400).json({ message: "No open rental found" });

    tx.status = "COMPLETED";
    await tx.save();

    // Clear umbrella data
    umbrella.activeReturnCode = null;
    umbrella.activeReturnCodeExpiresAt = null;
    umbrella.isAvailable = true;
    umbrella.currentLocation = returnLocation;
    await umbrella.save();

    // Clear student rented umbrella
    await Student.findByIdAndUpdate(studentId, {
      borrowedUmbrellaId: null,
    });

    return res.json({ message: "Return successful" });
  } catch (err) {
    console.error("Return error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



/* =====================================================
   ADMIN VIEWS
===================================================== */
exports.recent = async (req, res) => {
  try {
    const list = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(list);
  } catch (err) {
    console.error("Recent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.activeCodes = async (req, res) => {
  try {
    const open = await Transaction.find({ status: "OPEN" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(open);
  } catch (err) {
    console.error("Active codes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
