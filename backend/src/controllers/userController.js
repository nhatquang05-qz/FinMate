const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Hàm tạo JWT token (Tách ra để tái sử dụng)
const signJwtToken = (user, res) => {
    const payload = {
        user: {
            id: user.id,
        },
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
            if (err) throw err;
            res.json({ 
                token,
                userId: user.id,
                username: user.username,
                avatarURL: user.avatar_url,
            });
        }
    );
};


exports.registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fullName, dateOfBirth } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (username, email, password, full_name, date_of_birth) VALUES (?, ?, ?, ?, ?)';
        
        const [result] = await db.execute(sql, [username, email, hashedPassword, fullName, dateOfBirth]);

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
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [users] = await db.execute(sql, [username]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];

        // Nếu user có password (đăng ký thường) thì mới check
        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        } else if (user.google_id) {
            // User này đăng ký qua Google, không có mật khẩu
            return res.status(400).json({ message: 'Please login using Google' });
        }


        // Tái sử dụng hàm signJwtToken
        signJwtToken(user, res);

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// =================================================================
// TÍNH NĂNG MỚI: ĐĂNG NHẬP BẰNG GOOGLE
// =================================================================
exports.googleLogin = async (req, res) => {
    const { email, googleId, fullName, avatarUrl } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ message: 'Google email and ID are required.' });
    }

    try {
        // 1. Kiểm tra xem user đã tồn tại với google_id này chưa
        let sql = 'SELECT * FROM users WHERE google_id = ?';
        let [users] = await db.execute(sql, [googleId]);

        if (users.length > 0) {
            // Nếu có, đăng nhập và trả về token
            const user = users[0];
            return signJwtToken(user, res);
        }

        // 2. Nếu chưa, kiểm tra xem có user nào tồn tại với email này không
        // (Trường hợp họ đã đăng ký bằng email + password trước đó)
        sql = 'SELECT * FROM users WHERE email = ?';
        [users] = await db.execute(sql, [email]);

        if (users.length > 0) {
            // Đã có tài khoản, liên kết google_id với tài khoản này
            const user = users[0];
            const updateSql = 'UPDATE users SET google_id = ?, avatar_url = IFNULL(avatar_url, ?) WHERE id = ?';
            await db.execute(updateSql, [googleId, avatarUrl, user.id]);
            
            // Trả về token
            return signJwtToken(user, res);
        }

        // 3. Nếu không có cả google_id và email -> tạo tài khoản mới
        // Sử dụng phần đầu của email làm username (hoặc bạn có thể dùng fullName)
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        const insertSql = `
            INSERT INTO users 
            (username, email, google_id, full_name, avatar_url) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(insertSql, [
            username, 
            email, 
            googleId, 
            fullName, 
            avatarUrl
        ]);

        // Lấy lại thông tin user vừa tạo
        sql = 'SELECT * FROM users WHERE id = ?';
        const [newUsers] = await db.execute(sql, [result.insertId]);

        // Đăng nhập và trả về token
        return signJwtToken(newUsers[0], res);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             // Lỗi này có thể xảy ra nếu username (tạo tự động) bị trùng
            return res.status(409).json({ message: 'An error occurred. Please try again.' });
        }
        console.error('Error during Google login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// =================================================================
// KẾT THÚC TÍNH NĂNG MỚI
// =================================================================

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

        // Nếu user không có password (đăng ký qua Google), không cho đổi
        if (!user.password) {
            return res.status(400).json({ message: 'Cannot change password for Google-linked accounts.' });
        }

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
        const sql = 'SELECT id, username, email, full_name, date_of_birth, avatar_url FROM users WHERE id = ?';
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
    // SỬA LỖI: Đọc avatarURL từ req (do middleware truyền sang)
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
            avatarURL 
        });
    } catch (error) {
        console.error('Error updating user avatar in database:', error);
        res.status(500).json({ message: 'Server error during avatar update.' });
    }
};