const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, dateOfBirth } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql =
            'INSERT INTO users (username, email, password, full_name, date_of_birth) VALUES (?, ?, ?, ?, ?)';

        const [result] = await db.execute(sql, [
            username,
            email,
            hashedPassword,
            fullName,
            dateOfBirth,
        ]);

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error during user registration.' });
    }
};

exports.loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        const sql =
            'SELECT id, username, email, password, avatar_url FROM users WHERE username = ?';
        const [users] = await db.execute(sql, [username]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                userId: user.id,
                username: user.username,
                avatarURL: user.avatar_url,
            });
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const sqlSelect = 'SELECT password FROM users WHERE id = ?';
        const [users] = await db.execute(sqlSelect, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect old password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        const sqlUpdate = 'UPDATE users SET password = ? WHERE id = ?';
        await db.execute(sqlUpdate, [hashedNewPassword, userId]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const sql =
            'SELECT id, username, email, full_name, date_of_birth, avatar_url FROM users WHERE id = ?';
        const [users] = await db.execute(sql, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { fullName, dateOfBirth } = req.body;

    if (!fullName || !dateOfBirth) {
        return res.status(400).json({ message: 'Full name and date of birth are required.' });
    }

    try {
        const sql = 'UPDATE users SET full_name = ?, date_of_birth = ? WHERE id = ?';
        await db.execute(sql, [fullName, dateOfBirth, userId]);

        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAvatar = async (req, res) => {
    const { avatarURL } = req;
    const userId = req.user.id;

    if (!avatarURL) {
        return res.status(400).json({ message: 'Avatar URL is missing.' });
    }

    try {
        const sql = 'UPDATE users SET avatar_url = ? WHERE id = ?';
        await db.execute(sql, [avatarURL, userId]);

        res.json({
            message: 'Avatar updated successfully',
            avatarURL,
        });
    } catch (error) {
        console.error('Error updating user avatar in database:', error);
        res.status(500).json({ message: 'Server error during avatar update.' });
    }
};
