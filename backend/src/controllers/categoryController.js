const db = require('../config/db');
const { validationResult } = require('express-validator');

exports.createCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, type, icon, budget_limit } = req.body;
    const userId = req.user.id;

    try {
        const sql =
            'INSERT INTO categories (name, type, icon, user_id, budget_limit) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            name,
            type,
            icon || null,
            userId,
            budget_limit || 0,
        ]);

        res.status(201).json({
            id: result.insertId,
            name,
            type,
            icon,
            user_id: userId,
            budget_limit,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCategoriesByUser = async (req, res) => {
    const userId = req.user.id;
    const { type } = req.query;

    try {
        let sql = 'SELECT id, name, type, icon, budget_limit FROM categories WHERE user_id = ?';
        const params = [userId];

        if (type) {
            sql += ' AND type = ?';
            params.push(type);
        }

        const [categories] = await db.query(sql, params);
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, type, icon, budget_limit } = req.body;
    const userId = req.user.id;

    try {
        const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [id]);
        if (categories.length === 0) return res.status(404).json({ message: 'Category not found' });
        if (categories[0].user_id !== userId)
            return res.status(403).json({ message: 'Unauthorized' });

        const sql =
            'UPDATE categories SET name = ?, type = ?, icon = ?, budget_limit = ? WHERE id = ?';
        await db.execute(sql, [name, type, icon || null, budget_limit || 0, id]);

        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [id]);
        if (categories.length === 0) return res.status(404).json({ message: 'Category not found' });
        if (categories[0].user_id !== userId)
            return res.status(403).json({ message: 'Unauthorized' });

        await db.execute('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
