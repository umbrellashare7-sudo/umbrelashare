const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

exports.requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing authorization header" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid auth header" });

    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const admin = await Admin.findById(decoded.id).select("-passwordHash");
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
