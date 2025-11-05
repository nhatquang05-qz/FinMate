const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/users/profile
// @desc    Get user profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// @route   POST /api/users/register
// @desc    Register a new user
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('fullName', 'Full name is required').not().isEmpty(),
    body('dateOfBirth', 'Date of birth is required and must be in YYYY-MM-DD format').isISO8601().toDate(),
  ],
  userController.registerUser
);

// @route   POST /api/users/login
// @desc    Authenticate user & get token
router.post(
  '/login',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('password', 'Password is required').exists(),
  ],
  userController.loginUser
);

// @route   PUT /api/users/change-password
// @desc    Change user password (Protected)
router.put(
  '/change-password',
  [
    authMiddleware,
    body('oldPassword', 'Old password is required').not().isEmpty(),
    body('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 }),
  ],
  userController.changePassword
);

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

module.exports = router;