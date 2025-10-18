const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   POST /api/users/register
// @desc    Register a new user
router.post('/register', userController.registerUser);

// Thêm các route khác ở đây (login, get user profile,...)

module.exports = router;