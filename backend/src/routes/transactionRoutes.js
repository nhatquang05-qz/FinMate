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

// @route   GET /api/transactions/recent
// @desc    Get 3 recent transactions
router.get('/recent', transactionController.getRecentTransactions);

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
router.put('/:id', transactionValidation, transactionController.updateTransaction);

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// @route   GET /api/transactions/summary
// @desc    Get monthly transaction summary
router.get('/summary', transactionController.getTransactionSummary);

// @route   GET /api/transactions/report/pie-chart
// @desc    Get data for pie chart
router.get('/report/pie-chart', transactionController.getPieChartData);

// @route   GET /api/transactions/months-with-data
// @desc    Get months that have transaction data
router.get('/months-with-data', transactionController.getMonthsWithData);

// @route   GET /api/transactions/statistics
// @desc    Get statistics data for charts and reports
router.get('/statistics', transactionController.getStatistics);

// @route   GET /api/transactions/calendar-view
// @desc    Get data for the calendar screen
router.get('/calendar-view', transactionController.getCalendarView);

module.exports = router;