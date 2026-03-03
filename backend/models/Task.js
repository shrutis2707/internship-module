const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    weekNumber: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  { timestamps: true }
);

// Index for efficient querying
taskSchema.index({ studentId: 1, date: 1 });
taskSchema.index({ studentId: 1, year: 1, month: 1 });

module.exports = mongoose.model("Task", taskSchema);
