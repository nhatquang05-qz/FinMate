const Groq = require('groq-sdk');
const db = require('../config/db');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

if (!process.env.GROQ_API_KEY) {
    console.error('LỖI: Chưa có GROQ_API_KEY trong file .env');
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
        let financialContext = '';
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        try {
            const [summaryRows] = await db.execute(
                `SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
                FROM transactions 
                WHERE user_id = ? AND MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?`,
                [userId, currentMonth, currentYear],
            );

            const summary = summaryRows[0];
            const balance = (summary.totalIncome || 0) - (summary.totalExpense || 0);

            financialContext += `THÔNG TIN THÁNG ${currentMonth}/${currentYear}:\n`;
            financialContext += `- Thu: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalIncome || 0)}\n`;
            financialContext += `- Chi: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.totalExpense || 0)}\n`;
            financialContext += `- Số dư: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}\n`;

            const [recentRows] = await db.execute(
                `SELECT t.amount, t.type, t.transaction_date, c.name as category_name, t.note
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
                ORDER BY t.transaction_date DESC
                LIMIT 5`,
                [userId],
            );

            if (recentRows.length > 0) {
                financialContext += '\nGiao dịch gần nhất:\n';
                financialContext += recentRows
                    .map(t => {
                        const amount = new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(t.amount);
                        const date = new Date(t.transaction_date).toLocaleDateString('vi-VN');
                        return `- ${date}: ${t.type === 'income' ? 'Thu' : 'Chi'} ${amount} (${t.category_name})`;
                    })
                    .join('\n');
            }

            const [topExpenseRows] = await db.execute(
                `SELECT c.name, SUM(t.amount) as total
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.type = 'expense' AND MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?
                GROUP BY c.name
                ORDER BY total DESC
                LIMIT 3`,
                [userId, currentMonth, currentYear],
            );

            if (topExpenseRows.length > 0) {
                financialContext += '\n\nTop chi tiêu:\n';
                financialContext += topExpenseRows
                    .map(
                        c =>
                            `- ${c.name}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.total)}`,
                    )
                    .join('\n');
            }
        } catch (dbError) {
            console.error('Lỗi lấy dữ liệu tài chính (SQL):', dbError);
        }

        const systemPrompt = `
        Bạn là Finpet, một chuyên gia tài chính cá nhân thân thiện, sâu sắc và chuyên nghiệp.

        DỮ LIỆU CỦA NGƯỜI DÙNG HIỆN TẠI:
        ${financialContext}

        QUY TẮC TRẢ LỜI (BẮT BUỘC):
        1. **Văn phong**: 
           - Nói chuyện tự nhiên như người thật, thấu hiểu và sẻ chia.
           - Tránh dùng từ ngữ máy móc, cứng nhắc.
           - Nếu người dùng chi tiêu tốt (dư > 0), hãy khen ngợi. Nếu tiêu quá tay (âm hoặc dư ít), hãy cảnh báo nhẹ nhàng nhưng thực tế.
        
        2. **Định dạng (Format)**:
           - **HẠN CHẾ TỐI ĐA** dùng Markdown như in đậm (**text**) hay danh sách (* item) trừ khi thực sự cần liệt kê số liệu.
           - Viết thành các đoạn văn ngắn, mạch lạc.
           - KHÔNG bao giờ bắt đầu bằng "Dựa trên dữ liệu..." hay "Theo thông tin...". Hãy cứ nói thẳng vào vấn đề.

        3. **Nội dung**:
           - Phân tích sâu hơn một chút thay vì chỉ đọc lại số liệu. Ví dụ: Đừng chỉ nói "Bạn tiêu 5 triệu cho ăn uống", hãy nói "Tháng này tiền ăn uống có vẻ hơi cao nhỉ (5 triệu), bạn có thể cân nhắc nấu ăn ở nhà xem sao."
           - Luôn dùng Tiếng Việt.
           - Xưng "Finpet" và gọi người dùng là "bạn".
        `;

        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...history.map(item => ({
                role: item.role,
                content: item.content,
            })),
            {
                role: 'user',
                content: message,
            },
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL_NAME,
            temperature: 0.7,
            max_tokens: 800,
        });

        const reply =
            chatCompletion.choices[0]?.message?.content ||
            'Xin lỗi, Finpet đang suy nghĩ một chút, bạn hỏi lại sau nhé!';

        return { reply: reply, status: 200 };
    } catch (error) {
        console.error('Groq API Error:', error);
        if (error?.error?.code === 'invalid_api_key') {
            return {
                reply: 'Hệ thống đang bảo trì một chút (Lỗi API Key). Bạn quay lại sau nhé!',
                status: 200,
            };
        }
        throw { status: 500, error: 'Failed to get response from Finpet.' };
    }
};

module.exports = {
    askFinpetService,
};
