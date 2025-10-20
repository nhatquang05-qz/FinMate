const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/users/register
// @desc    Register a new user
router.post(
  '/register',
  [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
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

module.exports = router;