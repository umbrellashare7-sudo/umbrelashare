const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/student.model");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

/* -----------------------------------------
   AUTH USER (ADMIN OR STUDENT)
----------------------------------------- */
async function authUser(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ message: "Missing auth header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid auth header" });

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = await Admin.findById(decoded.id).select("-passwordHash");

    if (!user) {
      user = await Student.findById(decoded.id).select("-password");
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* -----------------------------------------
   ADMIN ONLY
----------------------------------------- */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.passwordHash) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

/* -----------------------------------------
   ANY AUTHENTICATED USER
----------------------------------------- */
function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ message: "Authentication required" });
  }
  next();
}

module.exports = {
  authUser,
  requireAdmin,
  requireUser,
};
