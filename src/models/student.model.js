const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  borrowedUmbrellaId: { type: String, default: null },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("Student", StudentSchema);
