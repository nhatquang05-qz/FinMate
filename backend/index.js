const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const cron = require('node-cron');
const db = require('./src/config/db');

const userRoutes = require('./src/routes/userRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const goalRoutes = require('./src/routes/goalRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);

cron.schedule('0 0 * * *', async () => {
    console.log('Running Recurring Transactions Job...');
    try {
        const today = new Date().toISOString().slice(0, 10);
        const sqlGet = `SELECT * FROM recurring_transactions WHERE is_active = 1 AND next_run_date <= ?`;
        const [recurrings] = await db.query(sqlGet, [today]);

        if (recurrings.length > 0) {
            for (const item of recurrings) {
                const sqlInsert = `INSERT INTO transactions (amount, type, transaction_date, note, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`;
                await db.execute(sqlInsert, [item.amount, item.type, new Date(), `[Tự động] ${item.note || ''}`, item.user_id, item.category_id]);

                const nextDate = new Date(item.next_run_date);
                nextDate.setMonth(nextDate.getMonth() + 1); 
                
                await db.execute(`UPDATE recurring_transactions SET next_run_date = ? WHERE id = ?`, [nextDate, item.id]);
            }
            console.log(`Processed ${recurrings.length} recurring transactions.`);
        }
    } catch (error) {
        console.error('Cron Job Error:', error);
    }
});

app.get('/', (req, res) => {
    res.send('FinMate Backend API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});