const chatService = require('../services/chatService');

exports.chatWithFinpet = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { message, history } = req.body;

        const result = await chatService.askFinpetService(userId, message, history || []);
        res.status(result.status).json(result);
    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(error.status || 500).json({ message: error.error || 'Internal Server Error' });
    }
};