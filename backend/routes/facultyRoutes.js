const router = require("express").Router();
const auth = require("../middleware/auth");
const Submission = require("../models/Submission");
const Review = require("../models/Review");
const catchAsync = require("../utils/catchAsync");
const { validate, reviewValidation, paginationValidation } = require("../middleware/validate");
const ApiError = require("../utils/ApiError");

// assigned list with pagination
router.get("/assigned",
  auth("faculty"),
  validate(paginationValidation),
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { assignedFacultyId: req.user.userId };
    if (status) query.status = status;

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate("studentId", "name email dept year")
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

// Get faculty's review history
router.get("/reviews",
  auth("faculty"),
  validate(paginationValidation),
  catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ facultyId: req.user.userId })
        .populate({
          path: "submissionId",
          select: "title type status studentId",
          populate: {
            path: "studentId",
            select: "name email"
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ facultyId: req.user.userId })
    ]);

    res.json({
      success: true,
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

// review submission
router.post("/review",
  auth("faculty"),
  validate(reviewValidation),
  catchAsync(async (req, res) => {
    const { submissionId, remarks, marks, decision } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    if (String(submission.assignedFacultyId) !== req.user.userId) {
      throw new ApiError(403, "This submission is not assigned to you");
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      submissionId,
      facultyId: req.user.userId
    });

    let review;
    if (existingReview) {
      // Update existing review
      existingReview.remarks = remarks || "";
      existingReview.marks = Number(marks || 0);
      existingReview.decision = decision;
      review = await existingReview.save();
    } else {
      // Create new review
      review = await Review.create({
        submissionId,
        facultyId: req.user.userId,
        remarks: remarks || "",
        marks: Number(marks || 0),
        decision
      });
    }

    submission.status = decision;
    submission.version += 1;
    await submission.save();

    res.json({
      success: true,
      message: "Review submitted successfully",
      review,
      newStatus: submission.status
    });
  })
);

// Get faculty dashboard stats
router.get("/stats", auth("faculty"), catchAsync(async (req, res) => {
  const [
    totalAssigned,
    pendingReviews,
    approvedCount,
    resubmissionCount,
    totalReviews
  ] = await Promise.all([
    Submission.countDocuments({ assignedFacultyId: req.user.userId }),
    Submission.countDocuments({
      assignedFacultyId: req.user.userId,
      status: { $in: ["Submitted", "Assigned"] }
    }),
    Submission.countDocuments({
      assignedFacultyId: req.user.userId,
      status: "Approved"
    }),
    Submission.countDocuments({
      assignedFacultyId: req.user.userId,
      status: "Resubmission Required"
    }),
    Review.countDocuments({ facultyId: req.user.userId })
  ]);

  res.json({
    success: true,
    stats: {
      assigned: totalAssigned,
      pending: pendingReviews,
      approved: approvedCount,
      resubmissions: resubmissionCount,
      totalReviews
    }
  });
}));

module.exports = router;