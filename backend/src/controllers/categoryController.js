const db = require('../config/db');
const { validationResult } = require('express-validator');

// @desc    Create a new category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, type, icon } = req.body;
  const userId = req.user.id; // Lấy từ authMiddleware

  try {
    const sql = 'INSERT INTO categories (name, type, icon, user_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [name, type, icon || null, userId]);

    res.status(201).json({
      id: result.insertId,
      name,
      type,
      icon,
      user_id: userId
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all categories for the logged-in user, optionally filtered by type
exports.getCategoriesByUser = async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query; // Lấy type từ query param (ví dụ: /api/categories?type=expense)

  try {
    let sql = 'SELECT id, name, type, icon FROM categories WHERE user_id = ?';
    const params = [userId];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    const [categories] = await db.query(sql, params);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a category
exports.updateCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { id } = req.params;
    const { name, type, icon } = req.body;
    const userId = req.user.id;
  
    try {
      // Security check: Make sure the category belongs to the user
      const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [id]);
      if (categories.length === 0) {
        return res.status(404).json({ message: 'Category not found' });
      }
      if (categories[0].user_id !== userId) {
        return res.status(403).json({ message: 'User not authorized to update this category' });
      }

      const sql = 'UPDATE categories SET name = ?, type = ?, icon = ? WHERE id = ?';
      await db.execute(sql, [name, type, icon || null, id]);
  
      res.json({ message: 'Category updated successfully' });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: 'Server error' });
    }
};
  
// @desc    Delete a category
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Security check: Make sure the category belongs to the user
        const [categories] = await db.query('SELECT user_id FROM categories WHERE id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (categories[0].user_id !== userId) {
            return res.status(403).json({ message: 'User not authorized to delete this category' });
        }

        await db.execute('DELETE FROM categories WHERE id = ?', [id]);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};