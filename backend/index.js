// index.js
const express = require('express');
require('dotenv').config();
const db = require('./src/config/db'); // Import để đảm bảo kết nối được khởi tạo
const userRoutes = require('./src/routes/userRoutes');

const app = express();

// Middleware để parse JSON từ request body
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('FinMate Backend API is running...');
});

// Sử dụng user routes với tiền tố /api/users
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});