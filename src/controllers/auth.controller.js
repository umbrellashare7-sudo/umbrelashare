const Admin = require("../models/Admin");
const Student = require("../models/student.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

/* -------------------------------------
   ADMIN REGISTER
------------------------------------- */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Admin already exists" });

    const hash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      passwordHash: hash,
    });

    res.json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------
   ADMIN LOGIN
------------------------------------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------
   GET CURRENT USER (ADMIN OR STUDENT)
------------------------------------- */
exports.me = async (req, res) => {
  try {
    const user = req.user; // set in authUser middleware

    if (!user) return res.status(401).json({ message: "Not authenticated" });

    // Admin detection
    if (user.passwordHash) {
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: "admin",
      });
    }

    // Student fallback
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: "student",
      balance: user.balance,
      borrowedUmbrellaId: user.borrowedUmbrellaId || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
