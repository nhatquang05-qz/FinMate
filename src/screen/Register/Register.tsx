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
import { scale } from '../../utils/scaling'; 

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
        height: '70%', 
        backgroundColor: "#FFFF",
        borderWidth: 1, 
        borderColor: '#E0E0E0',
        borderRadius: scale(25),
        shadowRadius: scale(35),
        paddingHorizontal: scale(24), 
        paddingTop: scale(35),   
        paddingBottom: scale(15),
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
        height: '9%', 
        backgroundColor: "#FFFFFF",
        borderRadius: scale(57), 
        marginBottom: scale(20), 
        justifyContent: 'center',
        paddingHorizontal: scale(20),
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                shadowColor: "rgba(0, 0, 0, 0.1)",
                shadowOffset: { width: 0, height: 4 },
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
        height: '9%',
        backgroundColor: "#04D1C1",
        borderRadius: scale(25), 
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: scale(15),
        marginBottom: scale(25),
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: scale(20), 
        fontFamily: 'Coiny-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: scale(10), 
    },
    footerText: {
        color: "#04D1C1",
        fontSize: scale(16), 
        fontWeight: '600', 
        fontFamily: 'BeVietnamPro-SemiBold', 
    },
});

export default RegisterScreen;