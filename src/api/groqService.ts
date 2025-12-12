import apiClient from './apiClient';

export const sendMessageToGroq = async (messages: any[]) => {
  try {
    // Lấy tin nhắn cuối cùng của user để gửi đi
    const lastUserMessage = messages[messages.length - 1];
    
    // Lấy lịch sử (trừ tin nhắn cuối vừa gửi)
    const history = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    // Gọi về Backend của chính mình
    const response = await apiClient.post('/chat', {
        message: lastUserMessage.content,
        history: history
    });

    // Backend trả về { reply: "..." }
    return {
        role: 'assistant',
        content: response.data.reply
    };

  } catch (error) {
    console.error('Error calling Finpet Backend:', error);
    throw error;
  }
};