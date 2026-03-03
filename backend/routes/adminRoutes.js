const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Certificate = require("../models/Certificate");
const catchAsync = require("../utils/catchAsync");
const { validate, assignFacultyValidation, paginationValidation } = require("../middleware/validate");
const ApiError = require("../utils/ApiError");

// Get all faculty for dropdown
router.get("/faculty", auth("admin"), catchAsync(async (req, res) => {
  const faculty = await User.find({ role: "faculty" }, "name email dept")
    .sort({ name: 1 });

  res.json({
    success: true,
    faculty
  });
}));

// users list with pagination and search
router.get("/users",
  auth("admin"),
  validate(paginationValidation),
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const [users, total] = await Promise.all([
      User.find(query, "name email role dept year createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// submissions list with pagination and filters
router.get("/submissions",
  auth("admin"),
  validate(paginationValidation),
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;
    const search = req.query.search || '';

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    let submissionsQuery = Submission.find(query)
      .populate("studentId", "name email dept year")
      .populate("assignedFacultyId", "name email")
      .sort({ createdAt: -1 });

    // If search is provided, we need to filter by student name
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }, '_id');
      const userIds = users.map(u => u._id);
      query.studentId = { $in: userIds };
    }

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate("studentId", "name email dept year")
        .populate("assignedFacultyId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments(query)
    ]);

    res.json({
      success: true,
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  })
);

// assign faculty
router.post("/assign",
  auth("admin"),
  validate(assignFacultyValidation),
  catchAsync(async (req, res) => {
    const { submissionId, facultyId } = req.body;

    // Verify faculty exists and has faculty role
    const faculty = await User.findOne({ _id: facultyId, role: "faculty" });
    if (!faculty) {
      throw new ApiError(404, "Faculty not found");
    }

    const updated = await Submission.findByIdAndUpdate(
      submissionId,
      { assignedFacultyId: facultyId, status: "Assigned" },
      { new: true }
    ).populate("assignedFacultyId", "name email");

    if (!updated) {
      throw new ApiError(404, "Submission not found");
    }

    res.json({
      success: true,
      message: "Faculty assigned successfully",
      submission: updated
    });
  })
);

// Get dashboard stats
router.get("/stats", auth("admin"), catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalStudents,
    totalFaculty,
    totalSubmissions,
    pendingSubmissions,
    assignedSubmissions,
    approvedSubmissions
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "faculty" }),
    Submission.countDocuments(),
    Submission.countDocuments({ status: "Submitted" }),
    Submission.countDocuments({ status: "Assigned" }),
    Submission.countDocuments({ status: "Approved" })
  ]);

  res.json({
    success: true,
    stats: {
      users: { total: totalUsers, students: totalStudents, faculty: totalFaculty },
      submissions: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        assigned: assignedSubmissions,
        approved: approvedSubmissions
      }
    }
  });
}));

// Search student by name or roll number and get all details
router.get("/student/search", auth("admin"), catchAsync(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Search for student by name or email (as roll number)
  const student = await User.findOne({
    role: "student",
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).select("-passwordHash");

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Get all related data
  const [tasks, certificates, submissions] = await Promise.all([
    Task.find({ studentId: student._id }).sort({ date: -1 }),
    Certificate.find({ studentId: student._id }).sort({ createdAt: -1 }),
    Submission.find({ studentId: student._id })
      .populate("assignedFacultyId", "name email")
      .sort({ createdAt: -1 })
  ]);

  res.json({
    success: true,
    student: {
      ...student.toObject(),
      tasks,
      certificates,
      submissions
    }
  });
}));

// Get all students list (for dropdown)
router.get("/students", auth("admin"), catchAsync(async (req, res) => {
  const students = await User.find({ role: "student" }, "name email dept year")
    .sort({ name: 1 });

  res.json({
    success: true,
    students
  });
}));

module.exports = router;