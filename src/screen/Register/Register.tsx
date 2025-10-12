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
} from "react-native";

const backgroundImage = require('../../assets/images/background.png')
const logoImage = require('../../assets/images/logo.png')

type RegisterScreenProps = {
  onNavigateToLogin: () => void;
};

const RegisterScreen = ({ onNavigateToLogin }: RegisterScreenProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = () => {
        console.log('Register attempt with:', { username, password, confirmPassword });
        if(username && password && confirmPassword) {
            if (password !== confirmPassword) {
                alert('Mật khẩu nhập lại không khớp. Vui lòng thử lại.');
                return;
            }
            alert(`Đăng ký thành công với tài khoản: ${username}`);
        } else {
            alert('Vui lòng nhập đầy đủ thông tin.');
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
                                {"Đăng ký"}
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
                             <Text style={styles.label}>
                                {"Nhập lại mật khẩu"}
                            </Text>
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
                            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                                <Text style={styles.buttonText}>
                                    {"Đăng ký"}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.footer}>
                                <TouchableOpacity onPress={onNavigateToLogin}>
                                    <Text style={styles.footerText}>
                                        {"Đã có tài khoản"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
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
        paddingHorizontal: 20,
    },
    mainContent: {
        alignItems: 'center',
    },
    logo: {
        marginTop: 50,
        width: 220, 
        height: 60,  
        marginBottom: 40, 
    },
    formContainer: {
        width: '100%',
        height: '70%', 
        backgroundColor: "#FFFF",
        borderRadius: 25,
        shadowRadius: 35,
        paddingHorizontal: 24, 
        paddingTop: 35,   
        paddingBottom: 15,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    title: {
        color: "#04D1C1",
        fontSize: 35, 
        textAlign: 'center',
        marginBottom: 10, 
        fontFamily: 'Coiny-Regular',
    },
    label: {
        color: "#04D1C1",
        fontSize: 18, 
        marginBottom: 10,
        marginLeft: 10, 
        fontFamily: 'BeVietnamPro-Bold',
    },
    inputContainer: {
        width: '95%',
        height: '9%', 
        backgroundColor: "#FFFFFF",
        borderRadius: 57, 
        marginBottom: 20, 
        justifyContent: 'center',
        paddingHorizontal: 20,
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 1,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    input: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'BeVietnamPro-Regular', 
    },
    button: {
        alignSelf: 'center',
        width: '70%',
        height: '9%',
        backgroundColor: "#04D1C1",
        borderRadius: 25, 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 25,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 20, 
        fontFamily: 'Coiny-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 10, 
    },
    footerText: {
        color: "#04D1C1",
        fontSize: 16, 
        fontWeight: '600', 
        fontFamily: 'BeVietnamPro-SemiBold', 
    },
});

export default RegisterScreen;