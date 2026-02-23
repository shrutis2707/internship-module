const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },

    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    remarks: { type: String, default: "" },

    marks: { type: Number, default: 0 },

    decision: { type: String, enum: ["Approved", "Resubmission Required"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);