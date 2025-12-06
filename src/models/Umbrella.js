const mongoose = require("mongoose");



const UmbrellaSchema = new mongoose.Schema(
  {
    umbrellaId: { type: String, required: true, unique: true }, // e.g. UMB-001
    name: { type: String },
    condition: {
      type: String,
      enum: ["NEW", "GOOD", "FAIR", "POOR"],
      set: (v) => (v ? v.toUpperCase() : v),
      default: "GOOD",
    },
    initialLocation: {
      type: String,
      enum: ["Main Gate", "Library", "Canteen", "Science Block"],
      required: true,
    },
    currentLocation: { type: String, default: null }, // or 'with:studentId'
    isAvailable: { type: Boolean, default: true },
    metadata: { type: Object, default: {} },
    activeBorrowCode: { type: String, default: null },
    activeReturnCode: { type: String, default: null },
    activeBorrowCodeExpiresAt: { type: Date, default: null },
    activeReturnCodeExpiresAt: { type: Date, default: null },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Umbrella", UmbrellaSchema);
