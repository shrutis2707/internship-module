const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const auth = require("../middleware/auth");
const Certificate = require("../models/Certificate");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

const uploadDir = path.join(__dirname, "..", "uploads", "certificates");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// PDF magic number validation
function validatePdfFile(filePath) {
  const buffer = fs.readFileSync(filePath);
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

// Get all certificates for student
router.get("/", auth("student"), catchAsync(async (req, res) => {
  const studentId = req.user.userId;

  const certificates = await Certificate.find({ studentId })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    certificates
  });
}));

// Upload certificate
router.post("/upload", auth("student"), upload.single("certificate"), catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Certificate PDF is required");
  }

  // Validate actual PDF content
  const fullPath = path.join(uploadDir, req.file.filename);
  if (!validatePdfFile(fullPath)) {
    fs.unlinkSync(fullPath);
    throw new ApiError(400, "Invalid PDF file");
  }

  const { title, type, issuingOrganization, issueDate, expiryDate } = req.body;

  if (!title || !type) {
    fs.unlinkSync(fullPath);
    throw new ApiError(400, "Title and type are required");
  }

  const filePath = "/uploads/certificates/" + req.file.filename;

  const certificate = await Certificate.create({
    studentId: req.user.userId,
    title,
    type,
    issuingOrganization: issuingOrganization || "",
    issueDate: issueDate ? new Date(issueDate) : null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    filePath,
    status: "pending"
  });

  res.status(201).json({
    success: true,
    message: "Certificate uploaded successfully",
    certificate
  });
}));

// Get certificate by ID
router.get("/:id", auth(), catchAsync(async (req, res) => {
  const certificateId = req.params.id;
  const userId = req.user.userId;
  const userRole = req.user.role;

  const certificate = await Certificate.findById(certificateId)
    .populate("studentId", "name email dept year");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  // Check permissions
  if (userRole === "student" && certificate.studentId._id.toString() !== userId) {
    throw new ApiError(403, "You can only view your own certificates");
  }

  res.json({
    success: true,
    certificate
  });
}));

// Delete certificate
router.delete("/:id", auth("student"), catchAsync(async (req, res) => {
  const certificateId = req.params.id;
  const studentId = req.user.userId;

  const certificate = await Certificate.findOne({ _id: certificateId, studentId });
  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  // Delete file
  const filePath = path.join(__dirname, "..", certificate.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Certificate.findByIdAndDelete(certificateId);

  res.json({
    success: true,
    message: "Certificate deleted successfully"
  });
}));

// Admin: Get all certificates
router.get("/admin/all", auth("admin"), catchAsync(async (req, res) => {
  const { studentId, status } = req.query;

  const query = {};
  if (studentId) query.studentId = studentId;
  if (status) query.status = status;

  const certificates = await Certificate.find(query)
    .populate("studentId", "name email dept year")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    certificates
  });
}));

// Admin: Update certificate status
router.patch("/:id/status", auth("admin"), catchAsync(async (req, res) => {
  const certificateId = req.params.id;
  const { status, remarks } = req.body;

  if (!status || !["pending", "approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Valid status is required");
  }

  const certificate = await Certificate.findByIdAndUpdate(
    certificateId,
    { status, remarks: remarks || "" },
    { new: true }
  ).populate("studentId", "name email");

  if (!certificate) {
    throw new ApiError(404, "Certificate not found");
  }

  res.json({
    success: true,
    message: "Certificate status updated",
    certificate
  });
}));

module.exports = router;
