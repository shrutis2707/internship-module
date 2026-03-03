const router = require("express").Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

// Get tasks for a date range
router.get("/", auth("student"), catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const studentId = req.user.userId;

  const query = { studentId };
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const tasks = await Task.find(query).sort({ date: 1 });

  res.json({
    success: true,
    tasks
  });
}));

// Create or update task for a date
router.post("/", auth("student"), catchAsync(async (req, res) => {
  const { date, description, completed } = req.body;
  const studentId = req.user.userId;

  if (!date || !description) {
    throw new ApiError(400, "Date and description are required");
  }

  const taskDate = new Date(date);
  const weekNumber = getWeekNumber(taskDate);
  const month = taskDate.getMonth() + 1;
  const year = taskDate.getFullYear();

  // Check if task already exists for this date
  let task = await Task.findOne({
    studentId,
    date: {
      $gte: new Date(taskDate.setHours(0, 0, 0, 0)),
      $lt: new Date(taskDate.setHours(23, 59, 59, 999))
    }
  });

  if (task) {
    // Update existing task
    task.description = description;
    task.completed = completed !== undefined ? completed : task.completed;
    await task.save();
  } else {
    // Create new task
    task = await Task.create({
      studentId,
      date: new Date(date),
      description,
      completed: completed || false,
      weekNumber,
      month,
      year
    });
  }

  res.json({
    success: true,
    message: "Task saved successfully",
    task
  });
}));

// Update task completion status
router.patch("/:id", auth("student"), catchAsync(async (req, res) => {
  const { completed } = req.body;
  const taskId = req.params.id;
  const studentId = req.user.userId;

  const task = await Task.findOne({ _id: taskId, studentId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  task.completed = completed;
  await task.save();

  res.json({
    success: true,
    message: "Task updated successfully",
    task
  });
}));

// Delete task
router.delete("/:id", auth("student"), catchAsync(async (req, res) => {
  const taskId = req.params.id;
  const studentId = req.user.userId;

  const task = await Task.findOneAndDelete({ _id: taskId, studentId });
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({
    success: true,
    message: "Task deleted successfully"
  });
}));

// Get task statistics
router.get("/stats/summary", auth("student"), catchAsync(async (req, res) => {
  const studentId = req.user.userId;
  const { year, month } = req.query;

  const query = { studentId };
  if (year) query.year = parseInt(year);
  if (month) query.month = parseInt(month);

  const totalTasks = await Task.countDocuments(query);
  const completedTasks = await Task.countDocuments({ ...query, completed: true });

  res.json({
    success: true,
    stats: {
      total: totalTasks,
      completed: completedTasks,
      pending: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  });
}));

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;
