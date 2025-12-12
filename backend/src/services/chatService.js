const Groq = require('groq-sdk');
const db = require('../config/db');
require('dotenv').config(); 

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
if (!process.env.GROQ_API_KEY) {
    console.error("LỖI: Chưa có GROQ_API_KEY trong file .env");
}

const MODEL_NAME = 'openai/gpt-oss-120b';

const askFinpetService = async (userId, message, history) => {
    if (!userId) {
        throw { status: 401, error: 'Unauthorized. Please log in.' };
    }
    if (!message) {
        throw { status: 400, error: 'Message is required.' };
    }

    try {
        let financialContext = "Dưới đây là thông tin tài chính hiện tại của người dùng:\n\n";

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        try {
            const [summaryRows] = await db.execute(`
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
                FROM transactions 
                WHERE user_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
            `, [userId, currentMonth, currentYear]);

            const summary = summaryRows[0];
            const balance = (summary.totalIncome || 0) - (summary.totalExpense || 0);

            financialContext += `== TỔNG QUAN THÁNG ${currentMonth}/${currentYear} ==\n`;
            financialContext += `- Tổng thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalIncome || 0)}\n`;
            financialContext += `- Tổng chi: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalExpense || 0)}\n`;
            financialContext += `- Số dư hiện tại: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}\n\n`;

            const [recentRows] = await db.execute(`
                SELECT t.amount, t.type, t.transaction_date, c.name as category_name, t.note
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
                ORDER BY t.transaction_date DESC
                LIMIT 5
            `, [userId]);

            if (recentRows.length > 0) {
                financialContext += "== GIAO DỊCH GẦN ĐÂY ==\n";
                financialContext += recentRows.map(t => {
                    const amount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(t.amount);
                    const date = new Date(t.transaction_date).toLocaleDateString('vi-VN');
                    return `- [${date}] ${t.type === 'income' ? 'Thu' : 'Chi'} ${amount}: ${t.category_name} (${t.note || 'Không ghi chú'})`;
                }).join("\n") + "\n\n";
            }

             const [topExpenseRows] = await db.execute(`
                SELECT c.name, SUM(t.amount) as total
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.date) = ? AND YEAR(t.date) = ?
                GROUP BY c.name
                ORDER BY total DESC
                LIMIT 3
            `, [userId, currentMonth, currentYear]);

            if (topExpenseRows.length > 0) {
                 financialContext += "== TOP CHI TIÊU THÁNG NÀY ==\n";
                 financialContext += topExpenseRows.map(c => 
                    `- ${c.name}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.total)}`
                 ).join("\n") + "\n\n";
            }

        } catch (dbError) {
            console.error("Lỗi lấy dữ liệu tài chính (SQL):", dbError);
        }

        const messages = [
            {
                role: "system",
                content: `Bạn là Finpet, trợ lý tài chính ảo thông minh của ứng dụng Finmate.
                
                ${financialContext}

                Nhiệm vụ của bạn:
                1. Trả lời ngắn gọn, thân thiện, CHỈ SỬ DỤNG TIẾNG VIỆT.
                2. Dựa vào dữ liệu tài chính ở trên để đưa ra lời khuyên (ví dụ: nếu chi tiêu quá nhiều so với thu, hãy cảnh báo).
                3. Nếu người dùng hỏi về giao dịch gần đây, hãy liệt kê chi tiết từ dữ liệu đã cung cấp.
                4. Động viên người dùng tiết kiệm và quản lý tài chính tốt hơn.
                5. Luôn xưng hô là "Finpet" và gọi người dùng là "bạn".
                6. Câu trả lời phải định dạng hợp lí, không máy móc cứng nhắc mà thân thiện.`
                
            },
            ...history.map(item => ({
                role: item.role,
                content: item.content
            })),
            {
                role: "user",
                content: message
            }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL_NAME,
            temperature: 0.7,
            max_tokens: 500,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Xin lỗi, Finpet đang ngủ gật một chút.";
        
        return { reply: reply, status: 200 };

    } catch (error) {
        console.error("Groq API Error:", error);
        if (error?.error?.code === 'invalid_api_key') {
             return { reply: "Lỗi hệ thống: API Key của Groq bị sai hoặc hết hạn. Vui lòng kiểm tra file .env ở Backend.", status: 200 };
        }
        throw { status: 500, error: 'Failed to get response from Finpet.' };
    }
};

module.exports = {
    askFinpetService
};