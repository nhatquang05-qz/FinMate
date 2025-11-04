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
    // **Security Check**: Verify the category belongs to the user
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

// @desc    Get monthly summary (total income, expense, balance)
exports.getTransactionSummary = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query; // e.g., month=11, year=2025

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
    }

    try {
        const sql = `
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpense
            FROM transactions
            WHERE 
                user_id = ? AND 
                MONTH(transaction_date) = ? AND 
                YEAR(transaction_date) = ?
        `;
        const [summary] = await db.query(sql, [userId, month, year]);
        
        const totalIncome = summary[0].totalIncome || 0;
        const totalExpense = summary[0].totalExpense || 0;
        const balance = totalIncome - totalExpense;

        res.json({
            totalIncome: parseFloat(totalIncome),
            totalExpense: parseFloat(totalExpense),
            balance: parseFloat(balance),
        });
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get data for pie chart (expenses grouped by category)
exports.getPieChartData = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
    }

    try {
        const sql = `
            SELECT 
                c.name AS categoryName,
                SUM(t.amount) AS totalAmount
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE 
                t.user_id = ? AND 
                t.type = 'expense' AND
                MONTH(t.transaction_date) = ? AND 
                YEAR(t.transaction_date) = ?
            GROUP BY c.name
            ORDER BY totalAmount DESC
            LIMIT 5; -- Lấy 5 danh mục chi nhiều nhất
        `;
        const [pieData] = await db.query(sql, [userId, month, year]);
        res.json(pieData.map(item => ({...item, totalAmount: parseFloat(item.totalAmount)})));
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all unique months/years that have transactions
exports.getMonthsWithData = async (req, res) => {
    const userId = req.user.id;
    try {
        const sql = `
            SELECT DISTINCT
                YEAR(transaction_date) AS year,
                MONTH(transaction_date) AS month
            FROM transactions
            WHERE user_id = ?
            ORDER BY year DESC, month DESC;
        `;
        const [months] = await db.query(sql, [userId]);
        res.json(months);
    } catch (error) {
        console.error('Error fetching months with data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get the 3 most recent transactions for the logged-in user
exports.getRecentTransactions = async (req, res) => {
  const userId = req.user.id;
  try {
    const sql = `
      SELECT 
        t.id, t.amount, t.type, t.transaction_date, t.note,
        c.name AS category_name, c.icon AS category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC
      LIMIT 3; 
    `;
    const params = [userId];

    const [transactions] = await db.query(sql, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};