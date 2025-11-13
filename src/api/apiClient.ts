import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ====================================================================
// !! QUAN TRỌNG: THAY ĐỔI ĐỊA CHỈ IP NÀY !!
// Đây là địa chỉ IP của máy tính đang chạy backend Node.js.
// Điện thoại/máy ảo và máy tính phải ở trong cùng một mạng Wi-Fi.
// Bạn không thể dùng 'localhost' hay '127.0.0.1' ở đây.
// ====================================================================

const API_BASE_URL = 'http://10.0.2.2:3000/api'; // dùng ipconfig để lấy địa chỉ IPv4 của máy tính trong phần Wireless LAN adapter Wi-Fi
// 'http://10.1.4.34:3000/api' 'http://192.168.1.11:3000/api'
// Tạo một instance của Axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cấu hình Interceptor (Bộ chặn) để tự động thêm token vào mỗi request
apiClient.interceptors.request.use(
  async (config) => {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');

    // Nếu token tồn tại, thêm nó vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Trả về config đã được sửa đổi để request tiếp tục được gửi đi
    return config;
  },
  (error) => {
    // Xử lý lỗi nếu có
    return Promise.reject(error);
  }
);

export default apiClient;