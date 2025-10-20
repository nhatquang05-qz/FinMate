const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

// Apply auth middleware to all transaction routes
router.use(authMiddleware);

const transactionValidation = [
    body('amount', 'Amount must be a valid positive number').isFloat({ gt: 0 }),
    body('type', 'Type must be "income" or "expense"').isIn(['income', 'expense']),
    body('transaction_date', 'Transaction date is required').isISO8601().toDate(),
    body('category_id', 'Category ID must be a valid number').isInt()
];

// @route   POST /api/transactions
// @desc    Create a transaction
router.post('/', transactionValidation, transactionController.createTransaction);

// @route   GET /api/transactions
// @desc    Get all transactions for a user
router.get('/', transactionController.getTransactionsByUser);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
router.put('/:id', transactionValidation, transactionController.updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;