const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    umbrella: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Umbrella",
      required: true,
    },
    umbrellaId: { type: String, required: true },
    studentId: { type: String, required: true }, // your frontend identifies students by some id/string
    studentName: { type: String },
    action: { type: String, enum: ["BORROW", "RETURN"], required: true },
    code: { type: String, required: true }, // one-time code shown to admin
    status: {
      type: String,
      enum: ["OPEN", "COMPLETED", "CANCELLED"],
      default: "OPEN",
    },
    pickupLocation: {
      type: String,
      enum: ["Main Gate", "Library", "Canteen", "Science Block"],
    },
    returnLocation: {
      type: String,
      enum: ["Main Gate", "Library", "Canteen", "Science Block"],
    },
    adminSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
