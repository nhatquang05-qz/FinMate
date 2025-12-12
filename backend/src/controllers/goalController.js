const db = require('../config/db');
const { validationResult } = require('express-validator');

exports.getGoals = async (req, res) => {
    try {
        const [goals] = await db.query(
            'SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id],
        );
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createGoal = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, target_amount, deadline, color, icon } = req.body;

    try {
        const sql =
            'INSERT INTO savings_goals (name, target_amount, deadline, color, icon, user_id) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            name,
            target_amount,
            deadline,
            color || '#04D1C1',
            icon || 'piggy-bank',
            req.user.id,
        ]);

        res.status(201).json({ id: result.insertId, ...req.body, current_amount: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateGoal = async (req, res) => {
    const { id } = req.params;
    const { name, target_amount, deadline, color } = req.body;
    const userId = req.user.id;

    try {
        const [goals] = await db.query(
            'SELECT id FROM savings_goals WHERE id = ? AND user_id = ?',
            [id, userId],
        );
        if (goals.length === 0) return res.status(404).json({ message: 'Goal not found' });

        const sql =
            'UPDATE savings_goals SET name = ?, target_amount = ?, deadline = ?, color = ? WHERE id = ?';
        await db.execute(sql, [name, target_amount, deadline, color, id]);

        res.json({ message: 'Goal updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateGoalAmount = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
        const [goals] = await db.query('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?', [
            id,
            req.user.id,
        ]);
        if (goals.length === 0) return res.status(404).json({ message: 'Goal not found' });

        const newAmount = parseFloat(goals[0].current_amount) + parseFloat(amount);

        await db.execute('UPDATE savings_goals SET current_amount = ? WHERE id = ?', [
            newAmount,
            id,
        ]);
        res.json({ message: 'Updated successfully', newAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM savings_goals WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Goal not found or unauthorized' });
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
