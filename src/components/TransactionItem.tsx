import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale } from '../utils/scaling';
import { Transaction } from '../types/data';

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => {
    const isExpense = item.type === 'expense';
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                {/* Có thể thêm Icon ở đây sau */}
                <View>
                    <Text style={styles.category}>{item.category_name}</Text>
                    {item.note && <Text style={styles.note}>{item.note}</Text>}
                </View>
            </View>
            <Text style={[styles.amount, { color: isExpense ? '#D9435E' : '#28A745' }]}>
                {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: scale(12), borderBottomWidth: 1, borderBottomColor: '#EEE' },
    left: { flexDirection: 'row', alignItems: 'center' },
    category: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15), color: '#333' },
    note: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(12), color: '#888' },
    amount: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15) },
});

export default TransactionItem;