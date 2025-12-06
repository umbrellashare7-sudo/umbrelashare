require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./src/models/Admin");

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "admin@uni.edu";
  const password = "admin123";

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("❌ Admin already exists");
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);

  await Admin.create({
    name: "Super Admin",
    email,
    passwordHash: hashed, // ← IMPORTANT FIX
    role: "admin",
  });

  console.log("✅ Admin created:");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit(0);
}

createAdmin();
