const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["internship", "course", "workshop", "other"], required: true },
    issuingOrganization: { type: String, default: "" },
    issueDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    filePath: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

// Index for efficient querying
certificateSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model("Certificate", certificateSchema);
