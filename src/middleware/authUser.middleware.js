const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/student.model");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

// Extract user (admin or student)
async function requireUser(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing auth header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid auth header" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Try admin
    let user = await Admin.findById(decoded.id).select("-passwordHash");
    if (user) {
      req.user = {
        ...user.toObject(),
        id: user._id.toString(),
        role: "admin",
      };

      return next();
    }

    // Try student
    user = await Student.findById(decoded.id).select("-password");
    if (user) {
      req.user = {
        ...user.toObject(),
        id: user._id.toString(), // <-- ADD THIS LINE
        role: "student",
      };

      return next();
    }

    return res.status(401).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ONLY allow admins
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = { requireUser, requireAdmin };
