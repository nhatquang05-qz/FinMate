const db = require('../config/db');
const { validationResult } = require('express-validator');

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

exports.createRecurringTransaction = async (req, res) => {
    const { amount, type, note, category_id, start_date } = req.body;
    const userId = req.user.id;

    try {
        const sql = `INSERT INTO recurring_transactions 
        (amount, type, note, category_id, user_id, frequency, start_date, next_run_date) 
        VALUES (?, ?, ?, ?, ?, 'monthly', ?, ?)`;
        
        const nextDate = new Date(start_date);
        nextDate.setMonth(nextDate.getMonth() + 1);

        await db.execute(sql, [amount, type, note, category_id, userId, start_date, nextDate]);
        res.status(201).json({ message: 'Recurring transaction created' });
    } catch (error) {
        console.error('Error recurring:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTransactionsByUser = async (req, res) => {
  const userId = req.user.id;
  const { type, limit, category_ids } = req.query;

  try {
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
    
    if (category_ids) {
        const categoryIdsArray = category_ids.split(',').map(id => parseInt(id, 10));
        if (categoryIdsArray.length > 0) {
            sql += ' AND t.category_id IN (?)';
            params.push(categoryIdsArray);
        }
    }
    
    sql += ' ORDER BY t.transaction_date DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const [transactions] = await db.query(sql, params);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, type, transaction_date, note, category_id } = req.body;
    const userId = req.user.id;

    try {
        const [transactions] = await db.query('SELECT user_id FROM transactions WHERE id = ?', [id]);
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        if (transactions[0].user_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to update this transaction' });
        }

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

exports.deleteTransaction = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
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

exports.getTransactionSummary = async (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query; 

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

exports.getStatistics = async (req, res) => {
    const userId = req.user.id;
    const { periodType, year, month, startDate, endDate } = req.query;
    
    let dateCondition = '';
    const params = [userId];

    if (periodType === 'year') {
        dateCondition = 'AND YEAR(t.transaction_date) = ?';
        params.push(year);
    } else if (periodType === 'month') {
        if (!month) return res.status(400).json({ message: 'Month is required.' });
        dateCondition = 'AND YEAR(t.transaction_date) = ? AND MONTH(t.transaction_date) = ?';
        params.push(year, month);
    } else if (periodType === 'week') {
        if (!startDate || !endDate) return res.status(400).json({ message: 'Start and end dates are required for weekly view.' });
        dateCondition = 'AND t.transaction_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    } else {
        return res.status(400).json({ message: 'Invalid period type.' });
    }

    try {
        const summarySql = `
            SELECT
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpense
            FROM transactions t
            WHERE t.user_id = ? ${dateCondition}
        `;

        const expenseByCategorySql = `
            SELECT c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.budget_limit AS budgetLimit, 
                   SUM(t.amount) AS totalAmount, COUNT(t.id) AS transactionCount
            FROM transactions t JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ? AND t.type = 'expense' ${dateCondition}
            GROUP BY c.id, c.name, c.icon, c.budget_limit ORDER BY totalAmount DESC;
        `;

        const incomeByCategorySql = `
            SELECT c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, 
                   SUM(t.amount) AS totalAmount, COUNT(t.id) AS transactionCount
            FROM transactions t JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ? AND t.type = 'income' ${dateCondition}
            GROUP BY c.id, c.name, c.icon ORDER BY totalAmount DESC;
        `;

        const [summaryResult, expenseByCategory, incomeByCategory] = await Promise.all([
            db.query(summarySql, params),
            db.query(expenseByCategorySql, params),
            db.query(incomeByCategorySql, params)
        ]);

        res.json({
            summary: {
                totalIncome: parseFloat(summaryResult[0][0].totalIncome) || 0,
                totalExpense: parseFloat(summaryResult[0][0].totalExpense) || 0,
            },
            expenseByCategory: expenseByCategory[0].map(item => ({ 
                ...item, 
                totalAmount: parseFloat(item.totalAmount),
                budgetLimit: parseFloat(item.budgetLimit) 
            })),
            incomeByCategory: incomeByCategory[0].map(item => ({ ...item, totalAmount: parseFloat(item.totalAmount) })),
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc Get all data needed for the calendar view for a specific month
exports.getCalendarView = async (req, res) => {
const userId = req.user.id;
const { month, year } = req.query;
if (!month || !year) {
    return res.status(400).json({ message: 'Month and year are required.' });
}

try {
    const summarySql = `
        SELECT
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS totalIncome,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS totalExpense
        FROM transactions
        WHERE user_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?;
    `;

    const dailySummarySql = `
        SELECT
            DATE(transaction_date) as date,
            SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as netAmount
        FROM transactions
        WHERE user_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
        GROUP BY DATE(transaction_date);
    `;

    const allTransactionsSql = `
        SELECT t.id, t.amount, t.type, t.transaction_date, t.note, c.name AS category_name
        FROM transactions t JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
        ORDER BY t.transaction_date DESC;
    `;
    
    const [summaryResult, dailySummaryResult, allTransactionsResult] = await Promise.all([
        db.query(summarySql, [userId, month, year]),
        db.query(dailySummarySql, [userId, month, year]),
        db.query(allTransactionsSql, [userId, month, year])
    ]);

    const summary = summaryResult[0][0];

    res.json({
        summary: {
            totalIncome: parseFloat(summary.totalIncome) || 0,
            totalExpense: parseFloat(summary.totalExpense) || 0,
            balance: (parseFloat(summary.totalIncome) || 0) - (parseFloat(summary.totalExpense) || 0),
        },
        dailySummaries: dailySummaryResult[0].map(d => ({...d, netAmount: parseFloat(d.netAmount)})),
        transactions: allTransactionsResult[0],
    });

} catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ message: 'Server error' });
}
};