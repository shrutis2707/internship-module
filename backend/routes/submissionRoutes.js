const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const Submission = require("../models/Submission");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const { validate, uploadValidation, paginationValidation } = require("../middleware/validate");
const ApiError = require("../utils/ApiError");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// PDF magic number validation
function validatePdfFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PDF files start with %PDF
  const pdfMagic = buffer.slice(0, 4).toString('ascii');
  return pdfMagic === '%PDF';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  }
});

function pdfOnly(req, file, cb) {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF files are allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter: pdfOnly,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Student upload
router.post("/upload",
  auth("student"),
  upload.single("report"),
  validate(uploadValidation),
  catchAsync(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "PDF file is required");
    }

    // Validate actual PDF content
    const fullPath = path.join(uploadDir, req.file.filename);
    if (!validatePdfFile(fullPath)) {
      fs.unlinkSync(fullPath);
      throw new ApiError(400, "Invalid PDF file");
    }

    const { title, type, domain, companyOrGuide } = req.body;
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

    res.status(201).json({
      success: true,
      message: "Submission uploaded successfully",
      submission
    });
  })
);

// Student view own submissions + reviews
router.get("/mine",
  auth("student"),
  validate(paginationValidation),
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find({ studentId: req.user.userId })
        .populate("assignedFacultyId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments({ studentId: req.user.userId })
    ]);

    const ids = submissions.map((s) => s._id);

    const reviews = await Review.find({ submissionId: { $in: ids } })
      .populate("facultyId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submissions,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// Get single submission with reviews
router.get("/:id",
  auth(),
  catchAsync(async (req, res) => {
    const submission = await Submission.findById(req.params.id)
      .populate("studentId", "name email dept year")
      .populate("assignedFacultyId", "name email");

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    // Check permissions
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (userRole === "student" && submission.studentId._id.toString() !== userId) {
      throw new ApiError(403, "You can only view your own submissions");
    }

    if (userRole === "faculty" && submission.assignedFacultyId?._id.toString() !== userId) {
      throw new ApiError(403, "This submission is not assigned to you");
    }

    const reviews = await Review.find({ submissionId: submission._id })
      .populate("facultyId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      submission,
      reviews
    });
  })
);

module.exports = router;