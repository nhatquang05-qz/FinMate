import apiClient from './apiClient';

export const sendMessageToGroq = async (messages: any[]) => {
  try {
    const lastUserMessage = messages[messages.length - 1];
    
    const history = messages.slice(0, messages.length - 1).map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    const response = await apiClient.post('/chat', {
        message: lastUserMessage.content,
        history: history
    });

    return {
        role: 'assistant',
        content: response.data.reply
    };

  } catch (error) {
    console.error('Error calling Finpet Backend:', error);
    throw error;
  }
};