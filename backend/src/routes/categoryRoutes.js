const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

// ÁP DỤNG MIDDLEWARE CHO TẤT CẢ CÁC ROUTE BÊN DƯỚI
// Điều này đảm bảo chỉ user đã đăng nhập mới có thể truy cập
router.use(authMiddleware);

// @route   POST /api/categories
// @desc    Create a category
router.post(
  '/',
  [
    body('name', 'Category name is required').not().isEmpty(),
    body('type', 'Category type must be "income" or "expense"').isIn(['income', 'expense']),
  ],
  categoryController.createCategory
);

// @route   GET /api/categories
// @desc    Get all categories for a user (can filter by type)
router.get('/', categoryController.getCategoriesByUser);

// @route   PUT /api/categories/:id
// @desc    Update a category
router.put(
    '/:id', 
    [
        body('name', 'Category name is required').not().isEmpty(),
        body('type', 'Category type must be "income" or "expense"').isIn(['income', 'expense']),
    ],
    categoryController.updateCategory
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;