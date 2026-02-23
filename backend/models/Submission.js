const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },

    type: { type: String, enum: ["internship", "project", "research"], required: true },

    domain: { type: String, default: "" },

    companyOrGuide: { type: String, default: "" },

    filePath: { type: String, required: true },

    status: {
      type: String,
      enum: ["Submitted", "Assigned", "Approved", "Resubmission Required"],
      default: "Submitted"
    },

    assignedFacultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);