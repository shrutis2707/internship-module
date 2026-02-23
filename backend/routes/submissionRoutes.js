const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const auth = require("../middleware/auth");
const Submission = require("../models/Submission");
const Review = require("../models/Review");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  }
});

function pdfOnly(req, file, cb) {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF allowed"));
}

const upload = multer({ storage, fileFilter: pdfOnly, limits: { fileSize: 10 * 1024 * 1024 } });

// Student upload
router.post("/upload", auth("student"), upload.single("report"), async (req, res) => {
  try {
    const { title, type, domain, companyOrGuide } = req.body;
    if (!req.file) return res.status(400).json({ message: "PDF required" });
    if (!title || !type) return res.status(400).json({ message: "Title and type required" });

    const filePath = "/uploads/" + req.file.filename;

    const submission = await Submission.create({
      studentId: req.user.userId,
      title,
      type,
      domain: domain || "",
      companyOrGuide: companyOrGuide || "",
      filePath,
      status: "Submitted"
    });

    res.json({ message: "Uploaded", submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student view own submissions + reviews
router.get("/mine", auth("student"), async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.userId })
      .populate("assignedFacultyId", "name email")
      .sort({ createdAt: -1 });

    const ids = submissions.map((s) => s._id);

    const reviews = await Review.find({ submissionId: { $in: ids } })
      .populate("facultyId", "name email")
      .sort({ createdAt: -1 });

    res.json({ submissions, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;