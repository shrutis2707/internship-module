const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg).join(', ');
    next(new ApiError(400, extractedErrors));
  };
};

// Auth validations
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['student', 'faculty', 'admin']).withMessage('Role must be student, faculty, or admin'),
  body('dept')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Department must be less than 50 characters'),
  body('year')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Year must be less than 20 characters')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Submission validations
const uploadValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['internship', 'project', 'research']).withMessage('Type must be internship, project, or research'),
  body('domain')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Domain must be less than 100 characters'),
  body('companyOrGuide')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Company/Guide must be less than 100 characters')
];

// Admin validations
const assignFacultyValidation = [
  body('submissionId')
    .notEmpty().withMessage('Submission ID is required')
    .isMongoId().withMessage('Invalid submission ID'),
  body('facultyId')
    .notEmpty().withMessage('Faculty ID is required')
    .isMongoId().withMessage('Invalid faculty ID')
];

// Faculty validations
const reviewValidation = [
  body('submissionId')
    .notEmpty().withMessage('Submission ID is required')
    .isMongoId().withMessage('Invalid submission ID'),
  body('decision')
    .notEmpty().withMessage('Decision is required')
    .isIn(['Approved', 'Resubmission Required']).withMessage('Decision must be Approved or Resubmission Required'),
  body('marks')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Marks must be between 0 and 100'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Remarks must be less than 1000 characters')
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  uploadValidation,
  assignFacultyValidation,
  reviewValidation,
  paginationValidation
};
