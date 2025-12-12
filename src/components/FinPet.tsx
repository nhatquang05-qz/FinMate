import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { scale } from '../utils/scaling';

interface FinPetProps {
    income: number;
    expense: number;
}

const FinPet: React.FC<FinPetProps> = ({ income, expense }) => {
    // Animation đơn giản để heo "thở"
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Logic xác định tâm trạng
    const getMood = () => {
        if (income === 0 && expense === 0) return {
            status: 'waiting',
            message: "Chào bạn! Hãy nhập thu nhập để mình giúp bạn quản lý nhé.",
            color: '#888'
        };
        
        if (income === 0 && expense > 0) return {
            status: 'worried',
            message: "Bạn đang chi tiêu mà chưa có thu nhập. Cẩn thận nhé!",
            color: '#FFA500' // Cam
        };

        const ratio = (expense / income) * 100;

        if (ratio > 90) return {
            status: 'sick',
            message: "Ối! Bạn sắp 'cháy túi' rồi. Hãy dừng chi tiêu ngay!",
            color: '#D9435E' // Đỏ
        };

        if (ratio > 70) return {
            status: 'sad',
            message: "Hic... Bạn đã tiêu hơn 70% thu nhập rồi đó.",
            color: '#FFC107' // Vàng
        };

        if (ratio < 50) return {
            status: 'happy',
            message: "Tuyệt vời! Bạn đang tiết kiệm rất tốt. Tiếp tục phát huy nhé!",
            color: '#28A745' // Xanh lá
        };

        return {
            status: 'normal',
            message: "Tài chính ổn định. Hãy chi tiêu hợp lý nhé.",
            color: '#04D1C1' // Xanh ngọc
        };
    };

    const mood = getMood();

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { borderColor: mood.color }]}>
                <Text style={[styles.message, { color: mood.color }]}>{mood.message}</Text>
            </View>
            
            <Animated.Image 
                // Sử dụng ảnh heo đất hiện có. Bạn có thể thay đổi ảnh khác (buồn/vui) tùy theo mood.status sau này
                source={require('../assets/images/piggy-bank.png')} 
                style={[styles.petImage, { transform: [{ scale: scaleAnim }] }]} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: scale(20),
        padding: scale(15),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginHorizontal: scale(5), // Căn chỉnh lề một chút để đẹp hơn trong card
    },
    petImage: {
        width: scale(60),
        height: scale(60),
        resizeMode: 'contain',
    },
    bubble: {
        flex: 1,
        marginRight: scale(15),
        padding: scale(10),
        borderRadius: scale(15),
        borderWidth: 1,
        backgroundColor: '#F9F9F9',
    },
    message: {
        fontFamily: 'BeVietnamPro-Bold', // Dùng font Bold để nhấn mạnh
        fontSize: scale(13),
        textAlign: 'left',
    }
});

export default FinPet;