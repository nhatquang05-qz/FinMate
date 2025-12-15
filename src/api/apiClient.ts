import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ====================================================================
// !! QUAN TRỌNG: THAY ĐỔI ĐỊA CHỈ IP NÀY !!
// ====================================================================

const API_BASE_URL = 'http://10.0.145.171:3000/api'; // Đảm bảo IP này đúng với máy tính của bạn

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Thêm interceptor cho response để xử lý lỗi 401
apiClient.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            console.error('Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
            // Tùy chọn: Xóa token cũ để app tự logout ở lần mở sau
            // await AsyncStorage.removeItem('userToken');
        }
        return Promise.reject(error);
    },
);

export default apiClient;
