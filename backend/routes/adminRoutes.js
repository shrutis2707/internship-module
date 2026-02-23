const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Submission = require("../models/Submission");

// users list
router.get("/users", auth("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "name email role dept year").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// submissions list
router.get("/submissions", auth("admin"), async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate("studentId", "name email dept year")
      .populate("assignedFacultyId", "name email")
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// assign faculty
router.post("/assign", auth("admin"), async (req, res) => {
  try {
    const { submissionId, facultyId } = req.body;
    if (!submissionId || !facultyId) {
      return res.status(400).json({ message: "submissionId and facultyId required" });
    }

    const updated = await Submission.findByIdAndUpdate(
      submissionId,
      { assignedFacultyId: facultyId, status: "Assigned" },
      { new: true }
    );

    res.json({ message: "Assigned", submission: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;