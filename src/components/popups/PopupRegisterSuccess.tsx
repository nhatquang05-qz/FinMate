import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native';
import { scale } from '../../utils/scaling';

// Bạn có thể thêm một icon thất bại vào assets/images nếu muốn
// const failIcon = require('../../assets/images/fail-icon.png');

type PopupProps = {
    visible: boolean;
    onClose: () => void;
};

const PopupRegisterSuccess = ({ visible, onClose }: PopupProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {/* <Image source={failIcon} style={styles.icon} /> */}
                    <Text style={styles.modalTitle}>Đăng ký thành công</Text>
                    <Text style={styles.modalText}>
                        Đăng ký tài khoản thành công!
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    },
    modalView: {
        width: '80%',
        margin: scale(20),
        backgroundColor: 'white',
        borderRadius: scale(20),
        padding: scale(25),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    icon: {
        width: scale(50),
        height: scale(50),
        marginBottom: scale(15),
    },
    modalTitle: {
        marginBottom: scale(10),
        textAlign: 'center',
        fontSize: scale(22),
        fontFamily: 'BeVietnamPro-Bold',
        color: '#1cf3a1ff', 
    },
    modalText: {
        marginBottom: scale(20),
        textAlign: 'center',
        fontSize: scale(16),
        fontFamily: 'BeVietnamPro-Regular',
        color: '#333'
    },
    button: {
        borderRadius: scale(20),
        paddingVertical: scale(10),
        paddingHorizontal: scale(30),
        elevation: 2,
        backgroundColor: '#04D1C1',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'BeVietnamPro-Bold',
        textAlign: 'center',
        fontSize: scale(16)
    },
});

export default PopupRegisterSuccess;