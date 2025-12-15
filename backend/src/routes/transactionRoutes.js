const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transactionController');

router.use(authMiddleware);

const transactionValidation = [
    body('amount', 'Amount must be a valid positive number').isFloat({ gt: 0 }),
    body('type', 'Type must be "income" or "expense"').isIn(['income', 'expense']),
    body('transaction_date', 'Transaction date is required').isISO8601().toDate(),
    body('category_id', 'Category ID must be a valid number').isInt(),
];

router.post('/', transactionValidation, transactionController.createTransaction);

router.get('/', transactionController.getTransactionsByUser);

router.get('/recent', transactionController.getRecentTransactions);

router.put('/:id', transactionValidation, transactionController.updateTransaction);

router.delete('/:id', transactionController.deleteTransaction);

router.get('/summary', transactionController.getTransactionSummary);

router.get('/report/pie-chart', transactionController.getPieChartData);

router.get('/months-with-data', transactionController.getMonthsWithData);

router.get('/statistics', transactionController.getStatistics);

router.get('/calendar-view', transactionController.getCalendarView);

router.post('/recurring', transactionController.createRecurringTransaction);
router.get('/recurring', transactionController.getRecurringTransactions);
router.patch('/recurring/:id/toggle', transactionController.toggleRecurringStatus);
router.delete('/recurring/:id', transactionController.deleteRecurringTransaction);

module.exports = router;
