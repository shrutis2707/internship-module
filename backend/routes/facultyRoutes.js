const router = require("express").Router();
const auth = require("../middleware/auth");
const Submission = require("../models/Submission");
const Review = require("../models/Review");

// assigned list
router.get("/assigned", auth("faculty"), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignedFacultyId: req.user.userId })
      .populate("studentId", "name email dept year")
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// review submission
router.post("/review", auth("faculty"), async (req, res) => {
  try {
    const { submissionId, remarks, marks, decision } = req.body;

    if (!submissionId || !decision) {
      return res.status(400).json({ message: "submissionId and decision required" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (String(submission.assignedFacultyId) !== req.user.userId) {
      return res.status(403).json({ message: "Not assigned to you" });
    }

    const review = await Review.create({
      submissionId,
      facultyId: req.user.userId,
      remarks: remarks || "",
      marks: Number(marks || 0),
      decision
    });

    submission.status = decision;
    await submission.save();

    res.json({ message: "Reviewed", review, newStatus: submission.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;