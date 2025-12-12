const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const goalController = require('../controllers/goalController');

router.use(authMiddleware);
router.get('/', goalController.getGoals);

router.post(
    '/',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('target_amount').isFloat({ gt: 0 }).withMessage('Valid amount required'),
        body('deadline').isISO8601().toDate().withMessage('Valid date required'),
    ],
    goalController.createGoal,
);

router.put('/:id', goalController.updateGoal);
router.put('/:id/add-money', goalController.updateGoalAmount);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
