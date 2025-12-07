const Transaction = require("../models/Transaction");
const Umbrella = require("../models/Umbrella");
const Student = require("../models/student.model"); // if not imported



/* =====================================================
   BORROW
===================================================== */
exports.borrow = async (req, res) => {
  try {
    const { umbrellaId, studentId, studentName, pickupLocation, code } =
      req.body;

    if (!umbrellaId || !studentId || !pickupLocation || !code)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // Validate borrow code + expiry
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

    // Clear borrow code
    umbrella.activeBorrowCode = null;
    umbrella.activeBorrowCodeExpiresAt = null;

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

    

    // Update student record
    const student = await Student.findById(studentId);
    if (student) {
      // DEBUG: log incoming body so we see what frontend sent
      console.log("BORROW REQUEST BODY:", req.body);

      // try find by ID first
      let student = null;
      try {
        student = await Student.findById(studentId);
      } catch (e) {
        console.warn("findById threw for studentId:", studentId, e.message);
      }

      if (!student) {
        // If not found by id, attempt to find by email (frontend might be sending email)
        console.log(
          "Student not found by _id. Trying fallback lookups for:",
          studentId
        );
        student = await Student.findOne({ email: studentId }).lean();
      }

      if (!student) {
        // final fallback: try matching by name (rare) — log and error out clearly
        console.log(
          "Student still not found. Searching by name:",
          req.body.studentName
        );
        student = await Student.findOne({ name: req.body.studentName }).lean();
      }

      if (!student) {
        console.error(
          "BORROW FAILED: student lookup failed. studentId provided:",
          studentId
        );
        return res
          .status(400)
          .json({
            message: "Student not found (check studentId sent by client)",
          });
      }

      // At this point student is a mongoose doc if found — if .lean() above returned a plain object, re-fetch as doc:
      if (!student.save) {
        // we used lean, fetch full doc to save
        student = await Student.findById(student._id);
      }

      student.borrowedUmbrellaId = umbrellaId;
      await student.save();
    }
    

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
    const { umbrellaId, studentId, code, returnLocation } = req.body;

    if (!umbrellaId || !studentId || !code || !returnLocation)
      return res.status(400).json({ message: "Missing fields" });

    const umbrella = await Umbrella.findOne({ umbrellaId });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // Validate return code + expiry
    if (
      umbrella.activeReturnCode !== code ||
      !umbrella.activeReturnCodeExpiresAt ||
      umbrella.activeReturnCodeExpiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or expired return code" });
    }

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
    umbrella.activeReturnCodeExpiresAt = null;

    umbrella.isAvailable = true;
    umbrella.currentLocation = returnLocation;

    await umbrella.save();
    // Update student record
    const student = await Student.findById(studentId);
    if (student) {
      student.borrowedUmbrellaId = null;
      await student.save();
    }

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
