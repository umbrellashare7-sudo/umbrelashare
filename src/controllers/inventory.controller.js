const Umbrella = require("../models/Umbrella");

// ------------------------------
// 6-digit random code generator
// ------------------------------
function generateCode4() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
}



exports.list = async (req, res) => {
  try {
    const items = await Umbrella.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const { umbrellaId, name, condition, initialLocation } = req.body;
    if (!umbrellaId || !initialLocation)
      return res
        .status(400)
        .json({ message: "umbrellaId and initialLocation required" });

    const existing = await Umbrella.findOne({ umbrellaId });
    if (existing)
      return res.status(400).json({ message: "umbrellaId already exists" });

    const newU = await Umbrella.create({
      umbrellaId,
      name,
      condition,
      initialLocation,
      currentLocation: initialLocation,
      isAvailable: true,
    });

    res.json(newU);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    const updated = await Umbrella.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Umbrella not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    await Umbrella.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!type || !["borrow", "return"].includes(type)) {
      return res.status(400).json({ message: "Invalid code type" });
    }

    const umbrella = await Umbrella.findOne({ umbrellaId: id });
    if (!umbrella)
      return res.status(404).json({ message: "Umbrella not found" });

    // Generate code + expiry
    const code = generateCode4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (type === "borrow") {
      umbrella.activeBorrowCode = code;
      umbrella.activeBorrowCodeExpiresAt = expiresAt;

      // clear opposite
      umbrella.activeReturnCode = null;
      umbrella.activeReturnCodeExpiresAt = null;
    } else {
      umbrella.activeReturnCode = code;
      umbrella.activeReturnCodeExpiresAt = expiresAt;

      umbrella.activeBorrowCode = null;
      umbrella.activeBorrowCodeExpiresAt = null;
    }

    await umbrella.save();

    res.json({
      umbrellaId: id,
      type,
      code,
      expiresAt,
      message: "Code generated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listPublic = async (req, res) => {
  try {
    const items = await Umbrella.find().select(
      "umbrellaId condition currentLocation isAvailable"
    );
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

