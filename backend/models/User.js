const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["student", "faculty", "admin"], required: true },

    dept: { type: String, default: "" },

    year: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);