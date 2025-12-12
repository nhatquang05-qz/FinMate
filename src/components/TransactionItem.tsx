import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale } from '../utils/scaling';
import { Transaction } from '../types/data';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => {
    const isExpense = item.type === 'expense';
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View>
                    <Text style={styles.category}>{item.category_name}</Text>
                    {!!item.note && <Text style={styles.note}>{item.note}</Text>}
                    <Text style={styles.date}>{formatDate(item.transaction_date)}</Text>
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
    date: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(12), color: '#AAA', paddingTop: scale(2) },
    left: { flexDirection: 'row', alignItems: 'center' },
    category: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15), color: '#333' },
    note: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(12), color: '#888' },
    amount: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15) },
});

export default TransactionItem;