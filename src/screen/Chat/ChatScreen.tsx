import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import { scale } from '../../utils/scaling';
import { sendMessageToGroq } from '../../api/groqService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatScreenProps {
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Mình là Finpet, trợ lý tài chính ảo của bạn. Bạn cần giúp gì về quản lý chi tiêu hôm nay?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Chuẩn bị payload cho API (loại bỏ id)
    const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));

    try {
      const responseMessage = await sendMessageToGroq(apiMessages);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseMessage.content,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, Finpet đang gặp sự cố kết nối. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.botText
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
       <ImageBackground 
        source={require('../../assets/images/background.png')} // Tận dụng background cũ
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Trở về'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trợ lý Finpet AI</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#04D1C1" />
          <Text style={styles.loadingText}>Finpet đang suy nghĩ...</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi Finpet về tài chính..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={isLoading}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: scale(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(15),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: Platform.OS === 'android' ? scale(25) : 0,
  },
  backButton: {
    padding: scale(10),
  },
  backText: {
    color: '#04D1C1',
    fontFamily: 'Coiny-Regular',
    fontSize: scale(14),
  },
  headerTitle: {
    fontSize: scale(18),
    fontFamily: 'Coiny-Regular',
    color: '#333',
  },
  listContent: {
    padding: scale(15),
    paddingBottom: scale(20),
  },
  messageBubble: {
    maxWidth: '80%',
    padding: scale(12),
    borderRadius: scale(15),
    marginBottom: scale(10),
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#04D1C1',
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  messageText: {
    fontSize: scale(15),
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: scale(22),
  },
  userText: {
    color: '#FFF',
  },
  botText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: scale(10),
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    fontSize: scale(15),
    fontFamily: 'BeVietnamPro-Regular',
    maxHeight: scale(100),
    marginRight: scale(10),
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#04D1C1',
    borderRadius: scale(20),
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
  },
  sendButtonText: {
    color: '#FFF',
    fontFamily: 'Coiny-Regular',
    fontSize: scale(14),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(15),
    marginBottom: scale(10),
  },
  loadingText: {
    marginLeft: scale(8),
    color: '#666',
    fontFamily: 'BeVietnamPro-Italic',
    fontSize: scale(12),
  },
});

export default ChatScreen;