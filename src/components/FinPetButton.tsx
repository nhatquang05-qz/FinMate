import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale } from '../utils/scaling';
import { SummaryData } from '../types/data';

interface FinPetButtonProps {
    summary: SummaryData | null;
    onPress: () => void;
}

const getFinPetStatus = (income: number, expense: number) => {
    if (income === 0 && expense === 0) return { text: 'Zzz... Ghi chép đi nào!' };

    const ratio = expense / (income || 1);

    if (ratio > 1) return { text: 'Báo động! Đang âm vốn rồi 😭' };
    if (ratio > 0.8) return { text: 'Cẩn thận, sắp hết tiền tiêu 💸' };
    if (ratio < 0.5) return { text: 'Tháng này tiết kiệm tốt quá! 😍' };

    return { text: 'Mọi thứ vẫn trong tầm kiểm soát 😎' };
};

const FinPetButton = ({ summary, onPress }: FinPetButtonProps) => {
    const [petMessage, setPetMessage] = useState('');
    const [showPetBubble, setShowPetBubble] = useState(false);

    useEffect(() => {
        if (summary) {
            const status = getFinPetStatus(summary.totalIncome, summary.totalExpense);
            setPetMessage(status.text);
            setShowPetBubble(true);
            const timer = setTimeout(() => setShowPetBubble(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [summary]);

    const handlePress = () => {
        onPress();
        setShowPetBubble(!showPetBubble);
    };

    return (
        <View style={styles.finpetContainer}>
            {showPetBubble && (
                <View style={styles.speechBubble}>
                    <Text style={styles.speechText}>{petMessage}</Text>
                    <View style={styles.speechArrow} />
                </View>
            )}
            <TouchableOpacity style={styles.finpetFab} onPress={handlePress} activeOpacity={0.8}>
                <Image
                    source={require('../assets/images/piggy-bank.png')}
                    style={styles.finpetIcon}
                />
                <View style={styles.finpetBadge}>
                    <Text style={styles.finpetText}>AI</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    finpetContainer: {
        position: 'absolute',
        bottom: scale(130),
        right: scale(20),
        alignItems: 'flex-end',
    },
    finpetFab: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#04D1C1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#04D1C1',
    },
    finpetIcon: {
        width: scale(35),
        height: scale(35),
        resizeMode: 'contain',
    },
    finpetBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFC107',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    finpetText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    speechBubble: {
        backgroundColor: 'white',
        padding: scale(10),
        borderRadius: scale(10),
        marginBottom: scale(10),
        maxWidth: scale(150),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    speechText: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(12),
        color: '#333',
    },
    speechArrow: {
        position: 'absolute',
        bottom: -10,
        right: 20,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'white',
    },
});

export default FinPetButton;
