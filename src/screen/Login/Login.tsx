import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    ImageBackground,
    ScrollView,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { scale } from '../../utils/scaling';
import PopupWrongPassword from '../../components/popups/PopupWrongPassword';
import PopupLoginSuccess from '../../components/popups/PopupLoginSuccess';
import PopupLoginFailed from '../../components/popups/PopupLoginFailed';
import PopupAccountNotExist from '../../components/popups/PopupAccountNotExist';
import apiClient from '../../api/apiClient';

// =================================================================
// TÍNH NĂNG MỚI: IMPORTS CHO GOOGLE LOGIN (ĐÃ CẬP NHẬT)
// =================================================================
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session'; // <-- 1. THÊM IMPORT NÀY
// =================================================================

// Hoàn tất bất kỳ phiên đăng nhập web nào đang chờ xử lý
WebBrowser.maybeCompleteAuthSession();

const guestImage = require('./guest.png');
const backgroundImage = require('../../assets/images/background.png')
const logoImage = require('../../assets/images/logo.png')
const googleIcon = require('../../assets/images/logo.png'); // !! THAY THẾ BẰNG ICON GOOGLE CỦA BẠN

type LoginScreenProps = {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
};

const LoginScreen = ({ onNavigateToRegister, onLoginSuccess }: LoginScreenProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [showWrongPasswordPopup, setShowWrongPasswordPopup] = useState(false);
    const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
    const [showLoginFailedPopup, setShowLoginFailedPopup] = useState(false);
    const [showAccountNotExistPopup, setShowAccountNotExistPopup] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // =================================================================
    // TÍNH NĂNG MỚI: GOOGLE AUTH HOOK (ĐÃ CẬP NHẬT)
    // =================================================================
    const [request, response, promptAsync] = Google.useAuthRequest({
        // Đọc từ biến môi trường
        clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        
        // 2. THAY THẾ 'useProxy: true' BẰNG DÒNG NÀY:
        redirectUri: makeRedirectUri({ preferLocalhost: true }),
    });
    // =================================================================


    // Lắng nghe phản hồi từ Google
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                fetchUserInfo(authentication.accessToken);
            }
        } else if (response?.type === 'error') {
            console.error("Google Auth Error: ", response.error);
            setShowLoginFailedPopup(true);
        }
    }, [response]);

    // Hàm lấy thông tin người dùng từ Google
    const fetchUserInfo = async (token: string) => {
        setIsLoading(true);
        try {
            const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userInfo = await googleResponse.json();
            
            // Gọi backend của chúng ta để đăng nhập hoặc đăng ký
            handleBackendGoogleLogin(userInfo);

        } catch (error) {
            console.error("Failed to fetch user info from Google", error);
            setShowLoginFailedPopup(true);
            setIsLoading(false);
        }
    };

    // Hàm gọi API /google-login của backend
    const handleBackendGoogleLogin = async (userInfo: { 
        id: string, 
        email: string, 
        name: string, 
        picture: string 
    }) => {
        try {
            const backendResponse = await apiClient.post('/users/google-login', {
                googleId: userInfo.id,
                email: userInfo.email,
                fullName: userInfo.name,
                avatarUrl: userInfo.picture,
            });

            const appToken = backendResponse.data.token;

            if (appToken) {
                await AsyncStorage.setItem('userToken', appToken);
                setShowLoginSuccessPopup(true);
                setTimeout(() => {
                   setShowLoginSuccessPopup(false);
                   onLoginSuccess();
                }, 1500);
            } else {
                setShowLoginFailedPopup(true);
            }

        } catch (error) {
            console.error("Backend Google login failed", error);
            setShowLoginFailedPopup(true);
        } finally {
            setIsLoading(false);
        }
    };
    // =================================================================
    // KẾT THÚC TÍNH NĂNG MỚI
    // =================================================================

    const handleLogin = async () => {
        if (!username || !password) {
            setShowLoginFailedPopup(true); // Hiển thị popup "vui lòng nhập"
            return;
        }

        setIsLoading(true); // Bắt đầu loading

        try {
            // Gọi API đăng nhập từ apiClient
            const response = await apiClient.post('/users/login', {
                username: username,
                password: password,
            });

            const token = response.data.token;

            if (token) {
                // Lưu token vào AsyncStorage để duy trì đăng nhập
                await AsyncStorage.setItem('userToken', token);
                // Hiển thị popup thành công
                setShowLoginSuccessPopup(true);

                // Chờ 1.5s rồi mới chuyển màn hình, giống logic cũ của bạn
                setTimeout(() => {
                   setShowLoginSuccessPopup(false);
                   onLoginSuccess(); // Báo cho App.tsx biết để chuyển màn hình
                }, 1500);
            } else {
                // Trường hợp hy hữu: API thành công nhưng không trả về token
                setShowLoginFailedPopup(true);
            }

        } catch (error) {
            // Xử lý các loại lỗi từ API
            if (axios.isAxiosError(error) && error.response) {
                // Lỗi từ phía server (ví dụ: 400, 404, 500)
                if (error.response.status === 400) {
                    // 400 Bad Request có nghĩa là "Invalid credentials"
                    // Backend trả về lỗi này cho cả sai mật khẩu và không tồn tại tài khoản
                    // Để đơn giản, ta có thể hiển thị chung một popup
                    setShowWrongPasswordPopup(true);
                } else {
                    // Các lỗi server khác
                    console.error("Login Error: ", error.response.data);
                    setShowLoginFailedPopup(true);
                }
            } else {
                // Lỗi mạng, không kết nối được tới server
                setShowLoginFailedPopup(true);
                console.error("Login Error: ", error);
            }
        } finally {
            // Dù thành công hay thất bại, luôn dừng loading
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={backgroundImage}
                resizeMode='cover'
                style={styles.backgroundImage}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.mainContent}>
                        <Image
                            source={logoImage}
                            resizeMode={"contain"}
                            style={styles.logo}
                        />
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>
                                {"Đăng nhập"}
                            </Text>
                            <Text style={styles.label}>
                                {"Tài khoản"}
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Nhập tài khoản của bạn"
                                    placeholderTextColor="#BDBDBD"
                                />
                            </View>
                            <Text style={styles.label}>
                                {"Mật khẩu"}
                            </Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Nhập mật khẩu của bạn"
                                    placeholderTextColor="#BDBDBD"
                                    secureTextEntry={true}
                                />
                            </View>
                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>
                                        {"Đăng nhập"}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* ================================================================= */}
                            {/* TÍNH NĂNG MỚI: NÚT ĐĂNG NHẬP GOOGLE */}
                            {/* ================================================================= */}
                            <TouchableOpacity 
                                style={[styles.button, styles.googleButton]} 
                                onPress={() => promptAsync()}
                                disabled={!request || isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#000000" />
                                ) : (
                                    <>
                                        {/* <Image source={googleIcon} style={styles.googleIcon} /> */}
                                        <Text style={[styles.buttonText, styles.googleButtonText]}>
                                            {"Đăng nhập với Google"}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            {/* ================================================================= */}


                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.guestLink}>
                                    <Image
                                        source={guestImage}
                                        resizeMode={"contain"}
                                        style={styles.guestIcon}
                                    />
                                    <Text style={styles.footerText}>
                                        {"Guest"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onNavigateToRegister}>
                                    <Text style={styles.footerText}>
                                        {"Tạo tài khoản"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <PopupWrongPassword
                    visible={showWrongPasswordPopup}
                    onClose={() => setShowWrongPasswordPopup(false)}
                />
                <PopupLoginSuccess
                    visible={showLoginSuccessPopup}
                    onClose={() => {
                        setShowLoginSuccessPopup(false);
                        onLoginSuccess();
                    }}
                />
                <PopupLoginFailed
                    visible={showLoginFailedPopup}
                    onClose={() => setShowLoginFailedPopup(false)}
                />
                <PopupAccountNotExist
                    visible={showAccountNotExistPopup}
                    onClose={() => setShowAccountNotExistPopup(false)}
                />
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    backgroundImage: {
        justifyContent: 'center',
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: scale(20),
    },
    mainContent: {
        alignItems: 'center',
    },
    logo: {
        marginTop: scale(50),
        width: scale(220),
        height: scale(60),
        marginBottom: scale(40),
    },
    formContainer: {
        width: '100%',
        /* Bỏ chiều cao cứng '63%' để form tự co giãn 
          khi thêm nút Google 
        */
        // height: '63%', 
        backgroundColor: "#FFFF",
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: scale(25),
        shadowRadius: scale(35),
        paddingHorizontal: scale(24),
        paddingTop: scale(35),
        paddingBottom: scale(25),
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: scale(2),
            },
            android: {
                elevation: scale(12),
            },
        }),
    },
    title: {
        color: "#04D1C1",
        fontSize: scale(35),
        textAlign: 'center',
        marginBottom: scale(10),
        fontFamily: 'Coiny-Regular',
    },
    label: {
        color: "#04D1C1",
        fontSize: scale(18),
        marginBottom: scale(10),
        marginLeft: scale(10),
        fontFamily: 'BeVietnamPro-Bold',
    },
    inputContainer: {
        width: '95%',
        height: '12%',
        minHeight: scale(45), // Thêm chiều cao tối thiểu
        backgroundColor: "#ffffffff",
        borderRadius: scale(57),
        marginBottom: scale(20),
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                shadowColor: "#0000001a",
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 1,
                shadowRadius: scale(5),
            },
            android: {
                elevation: scale(5),
            },
        }),
    },
    input: {
        fontSize: scale(16),
        color: '#333',
        fontFamily: 'BeVietnamPro-Regular',
    },
    button: {
        alignSelf: 'center',
        width: '70%',
        height: '12%',
        minHeight: scale(45), // Thêm chiều cao tối thiểu
        backgroundColor: "#04D1C1",
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(15),
        marginBottom: scale(10), // Giảm margin bottom
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
    },
    // =================================================================
    // STYLES MỚI CHO NÚT GOOGLE
    // =================================================================
    googleButton: {
        width: '90%', // Làm nút Google rộng hơn
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E0E0',
        borderWidth: 1,
        marginTop: scale(10),
        marginBottom: scale(25), // Tăng margin bottom
        flexDirection: 'row',
    },
    googleButtonText: {
        color: '#333333',
        fontSize: scale(18),
        fontFamily: 'BeVietnamPro-SemiBold', // Dùng font khác cho chuyên nghiệp
    },
    googleIcon: {
        width: scale(20),
        height: scale(20),
        marginRight: scale(10),
    },
    // =================================================================
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(10),
    },
    guestLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: "#04D1C1",
        fontSize: scale(16),
        fontWeight: '600',
        fontFamily: 'BeVietnamPro-SemiBold',
    },
    guestIcon: {
        width: scale(18),
        height: scale(18),
        marginRight: scale(8),
    },
});

export default LoginScreen;