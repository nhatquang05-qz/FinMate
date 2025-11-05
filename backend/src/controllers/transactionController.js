const db = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Create a new transaction
exports.createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, type, transaction_date, note, category_id } = req.body;
  const userId = req.user.id;

  try {
    
    const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (categories[0].user_id !== userId) {
      return res.status(403).json({ message: 'User not authorized to use this category' });
    }

    const sql = 'INSERT INTO transactions (amount, type, transaction_date, note, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, [amount, type, transaction_date, note, userId, category_id]);

    res.status(201).json({
      id: result.insertId,
      ...req.body,
      user_id: userId
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all transactions for the logged-in user
exports.getTransactionsByUser = async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query; // For filtering by income or expense

  try {
    // We use a JOIN to get category info along with the transaction
    let sql = `
      SELECT 
        t.id, t.amount, t.type, t.transaction_date, t.note,
        c.name AS category_name, c.icon AS category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY t.transaction_date DESC'; // Show newest first

    const [transactions] = await db.query(sql, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a transaction
exports.updateTransaction = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, type, transaction_date, note, category_id } = req.body;
    const userId = req.user.id;

    try {
        // **Security Check**: Verify the transaction belongs to the user
        const [transactions] = await db.query('SELECT user_id FROM transactions WHERE id = ?', [id]);
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transactions[0].user_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to update this transaction' });
        }

        // (Optional but good) Security check for new category_id
        if(category_id) {
            const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [category_id]);
            if (categories.length === 0 || categories[0].user_id !== userId) {
                return res.status(403).json({ message: 'Invalid category for this user' });
            }
        }

        const sql = 'UPDATE transactions SET amount = ?, type = ?, transaction_date = ?, note = ?, category_id = ? WHERE id = ?';
        await db.execute(sql, [amount, type, transaction_date, note, category_id, id]);

        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a transaction
exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // **Security Check**: Verify the transaction belongs to the user
        const [transactions] = await db.query('SELECT user_id FROM transactions WHERE id = ?', [id]);
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transactions[0].user_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to delete this transaction' });
        }

        await db.execute('DELETE FROM transactions WHERE id = ?', [id]);

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};