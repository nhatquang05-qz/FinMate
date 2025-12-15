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
    Alert,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import { scale } from '../utils/scaling';
import PopupWrongPassword from '../components/popups/PopupWrongPassword';
import PopupLoginSuccess from '../components/popups/PopupLoginSuccess';
import PopupLoginFailed from '../components/popups/PopupLoginFailed';
import PopupAccountNotExist from '../components/popups/PopupAccountNotExist';
import apiClient from '../api/apiClient';

const guestImage = require('../assets/images/guest.png');
const backgroundImage = require('../assets/images/background.png');
const logoImage = require('../assets/images/logo.png');

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

    const handleBiometricLogin = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            Alert.alert('Lỗi', 'Thiết bị không hỗ trợ hoặc chưa cài đặt khóa sinh trắc học.');
            return;
        }

        const savedToken = await AsyncStorage.getItem('biometricToken');

        if (!savedToken) {
            Alert.alert(
                'Thông báo',
                'Vui lòng đăng nhập bằng mật khẩu lần đầu tiên để kích hoạt tính năng này.',
            );
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Đăng nhập nhanh bằng sinh trắc học',
            fallbackLabel: 'Dùng mật khẩu',
        });

        if (result.success) {
            await AsyncStorage.setItem('userToken', savedToken);

            setShowLoginSuccessPopup(true);
            setTimeout(() => {
                setShowLoginSuccessPopup(false);
                onLoginSuccess();
            }, 1000);
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setShowLoginFailedPopup(true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.post('/users/login', {
                username: username,
                password: password,
            });

            const token = response.data.token;

            if (token) {
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('biometricToken', token);

                setShowLoginSuccessPopup(true);

                setTimeout(() => {
                    setShowLoginSuccessPopup(false);
                    onLoginSuccess();
                }, 1500);
            } else {
                setShowLoginFailedPopup(true);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 400) {
                    setShowWrongPasswordPopup(true);
                } else {
                    console.error('Login Error: ', error.response.data);
                    setShowLoginFailedPopup(true);
                }
            } else {
                setShowLoginFailedPopup(true);
                console.error('Login Error: ', error);
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
                            <Text style={styles.title}>{'Đăng nhập'}</Text>
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
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>{'Đăng nhập'}</Text>
                                )}
                            </TouchableOpacity>
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.guestLink}
                                    onPress={handleBiometricLogin}>
                                    <Image
                                        source={guestImage}
                                        resizeMode={'contain'}
                                        style={styles.guestIcon}
                                    />
                                    <Text style={styles.footerText}>{'Vân tay / FaceID'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onNavigateToRegister}>
                                    <Text style={styles.footerText}>{'Tạo tài khoản'}</Text>
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
        backgroundColor: '#FFFFFF',
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
        height: '63%',
        backgroundColor: '#FFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: scale(25),
        shadowRadius: scale(35),
        paddingHorizontal: scale(24),
        paddingTop: scale(35),
        paddingBottom: scale(25),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
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
        color: '#04D1C1',
        fontSize: scale(35),
        textAlign: 'center',
        marginBottom: scale(10),
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
        width: '95%',
        height: '12%',
        backgroundColor: '#ffffffff',
        borderRadius: scale(57),
        marginBottom: scale(20),
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#0000001a',
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
        backgroundColor: '#04D1C1',
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(15),
        marginBottom: scale(35),
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
    },
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
        color: '#04D1C1',
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
