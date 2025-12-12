const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

router.use(authMiddleware);

router.post(
    '/',
    [
        body('name', 'Category name is required').not().isEmpty(),
        body('type', 'Category type must be "income" or "expense"').isIn(['income', 'expense']),
    ],
    categoryController.createCategory,
);
router.get('/', categoryController.getCategoriesByUser);

router.put(
    '/:id',
    [
        body('name', 'Category name is required').not().isEmpty(),
        body('type', 'Category type must be "income" or "expense"').isIn(['income', 'expense']),
    ],
    categoryController.updateCategory,
);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
