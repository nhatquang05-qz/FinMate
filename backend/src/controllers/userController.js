const db = require('../config/db');
// Trong thực tế, bạn sẽ cần hash mật khẩu. Dùng thư viện như bcryptjs
// const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input (bạn nên dùng một thư viện validation như Joi hoặc express-validator)
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    // Trong thực tế:
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    const hashedPassword = password; // Tạm thời chưa hash

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [username, email, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });
  } catch (error) {
    // Mã lỗi 1062 là cho duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error during user registration.' });
  }
};