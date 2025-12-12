import React, { useState } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { scale } from '../../utils/scaling';
import PopupRegisterSuccess from '../../components/popups/PopupRegisterSuccess';
import PopupAccountExisted from '../../components/popups/PopupAccountExisted';
import PopupPassNotMatch from '../../components/popups/PopupPassNotMatch';
import PopupNotEnoughInfo from '../../components/popups/PopupNotEnoughInfo';
import apiClient from '../../api/apiClient';

const backgroundImage = require('../../assets/images/background.png');
const logoImage = require('../../assets/images/logo.png');

type RegisterScreenProps = {
    onNavigateToLogin: () => void;
};

const RegisterScreen = ({ onNavigateToLogin }: RegisterScreenProps) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [showRegisterSuccessPopup, setShowRegisterSuccessPopup] = useState(false);
    const [showAccountExistedPopup, setShowAccountExistedPopup] = useState(false);
    const [showPassNotMatchPopup, setShowPassNotMatchPopup] = useState(false);
    const [showNotEnoughInfoPopup, setShowNotEnoughInfoPopup] = useState(false);

    const handleRegister = async () => {
        // Validation phía client
        if (!username || !email || !fullName || !dateOfBirth || !password || !confirmPassword) {
            setShowNotEnoughInfoPopup(true);
            return;
        }

        if (password !== confirmPassword) {
            setShowPassNotMatchPopup(true);
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/users/register', {
                username,
                email,
                password,
                fullName,
                dateOfBirth, // API yêu cầu định dạng 'YYYY-MM-DD'
            });

            // Nếu không có lỗi, tức là đăng ký thành công
            setShowRegisterSuccessPopup(true);
            // Popup này sẽ tự động gọi onNavigateToLogin khi đóng
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 409) {
                    // 409 Conflict: Username hoặc email đã tồn tại
                    setShowAccountExistedPopup(true);
                } else {
                    // Các lỗi khác từ server (ví dụ: 400 - validation sai)
                    setShowNotEnoughInfoPopup(true);
                }
            } else {
                // Lỗi mạng hoặc lỗi không xác định
                setShowNotEnoughInfoPopup(true);
                console.error('Register Error: ', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={backgroundImage}
                resizeMode="cover"
                style={styles.backgroundImage}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.mainContent}>
                        <Image source={logoImage} resizeMode={'contain'} style={styles.logo} />
                        <View style={styles.formContainer}>
                            <Text style={styles.title}>{'Đăng kí'}</Text>

                            <Text style={styles.label}>{'Tài khoản'}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Nhập tài khoản của bạn"
                                    placeholderTextColor="#BDBDBD"
                                />
                            </View>

                            <Text style={styles.label}>{'Email'}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Nhập email của bạn"
                                    placeholderTextColor="#BDBDBD"
                                    keyboardType="email-address"
                                />
                            </View>

                            <Text style={styles.label}>{'Họ và tên'}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Nhập họ và tên đầy đủ"
                                    placeholderTextColor="#BDBDBD"
                                />
                            </View>

                            <Text style={styles.label}>{'Ngày sinh'}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#BDBDBD"
                                />
                            </View>
                            <Text style={styles.label}>{'Mật khẩu'}</Text>
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

                            <Text style={styles.label}>{'Nhập lại mật khẩu'}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Nhập lại mật khẩu của bạn"
                                    placeholderTextColor="#BDBDBD"
                                    secureTextEntry={true}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleRegister}
                                disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>{'Đăng kí'}</Text>
                                )}
                            </TouchableOpacity>
                            <View style={styles.footer}>
                                <TouchableOpacity onPress={onNavigateToLogin}>
                                    <Text style={styles.footerText}>{'Đăng nhập'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <PopupRegisterSuccess
                    visible={showRegisterSuccessPopup}
                    onClose={() => {
                        setShowRegisterSuccessPopup(false);
                        onNavigateToLogin();
                    }}
                />
                <PopupAccountExisted
                    visible={showAccountExistedPopup}
                    onClose={() => setShowAccountExistedPopup(false)}
                />
                <PopupPassNotMatch
                    visible={showPassNotMatchPopup}
                    onClose={() => setShowPassNotMatchPopup(false)}
                />
                <PopupNotEnoughInfo
                    visible={showNotEnoughInfoPopup}
                    onClose={() => setShowNotEnoughInfoPopup(false)}
                />
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundImage: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        paddingVertical: scale(30),
    },
    mainContent: {
        alignItems: 'center',
    },
    logo: {
        width: scale(220),
        height: scale(60),
        marginBottom: scale(40),
    },
    formContainer: {
        width: '100%',
        backgroundColor: '#FFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: scale(25),
        paddingHorizontal: scale(24),
        paddingVertical: scale(35),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: scale(2),
            },
            android: { elevation: 12 },
        }),
    },
    title: {
        color: '#04D1C1',
        fontSize: scale(35),
        textAlign: 'center',
        marginBottom: scale(20),
        fontFamily: 'Coiny-Regular',
    },
    label: {
        color: '#04D1C1',
        fontSize: scale(18),
        marginBottom: scale(10),
        marginLeft: scale(10),
        fontFamily: 'BeVietnamPro-Bold',
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(57),
        marginBottom: scale(15), // Giảm margin một chút
        paddingHorizontal: scale(20),
        paddingVertical: Platform.OS === 'ios' ? scale(12) : scale(8), // Dùng padding thay vì height
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowOffset: { width: 2, height: 4 },
                shadowOpacity: 1,
                shadowRadius: scale(5),
            },
            android: { elevation: 5 },
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
        backgroundColor: '#04D1C1',
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(12),
        marginTop: scale(15),
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scale(20),
    },
    footerText: {
        color: '#04D1C1',
        fontSize: scale(16),
        fontWeight: '600',
        fontFamily: 'BeVietnamPro-SemiBold',
    },
});

export default RegisterScreen;
