const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve pdf uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// serve frontend html pages
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Server Running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log("Server started on port", process.env.PORT);
    });
  })
  .catch((err) => console.log("MongoDB Error:", err.message));