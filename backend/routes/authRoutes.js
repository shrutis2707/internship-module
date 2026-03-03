const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { validate, registerValidation, loginValidation } = require("../middleware/validate");
const ApiError = require("../utils/ApiError");

// Register
router.post("/register", validate(registerValidation), catchAsync(async (req, res) => {
  const { name, email, password, role = "student", dept = "", year = "" } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, passwordHash, role, dept, year });

  res.status(201).json({
    success: true,
    message: "Registered successfully",
    userId: user._id
  });
}));

// Login
router.post("/login", validate(loginValidation), catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    role: user.role,
    name: user.name,
    userId: user._id
  });
}));

// Forgot Password
router.post("/forgot-password", catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      success: true,
      message: "If an account exists, a password reset link has been sent"
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetPasswordExpires = Date.now() + 3600000;

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = resetPasswordExpires;
  await user.save();

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }
  }

  res.json({
    success: true,
    message: "If an account exists, a password reset link has been sent",
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
}));

// Reset Password
router.post("/reset-password", catchAsync(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, "Token and password are required");
  }

  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({
    success: true,
    message: "Password reset successfully"
  });
}));

// Get current user
router.get("/me", catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.slice(7);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.userId).select('-passwordHash');
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dept: user.dept,
      year: user.year
    }
  });
}));

module.exports = router;