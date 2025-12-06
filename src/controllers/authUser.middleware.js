const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/student.model");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

exports.requireUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing auth header" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const student = await Student.findById(decoded.id);
    if (student) {
      req.user = student;
      return next();
    }

    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.user = admin;
      return next();
    }

    return res.status(401).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

exports.requireAdmin = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing auth header" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.user = admin;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
