import React, { useState, useMemo } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import Calendar from '../components/Calendar';
import { scale } from '../utils/scaling';

const MOCK_TRANSACTIONS = [
    { id: 1, date: '2025-10-15', type: 'expense', amount: 150000 },
    { id: 2, date: '2025-10-15', type: 'income', amount: 2000000 },
    { id: 3, date: '2025-10-16', type: 'expense', amount: 50000 },
    { id: 4, date: '2025-10-16', type: 'expense', amount: 75000 },
    { id: 5, date: '2025-10-17', type: 'income', amount: 500000 },
];

const StatBox = ({ label, amount, color }: { label: string, amount: number, color: string }) => (
    <View style={styles.statBox}>
        <View style={[styles.statBoxContent, { backgroundColor: color }]}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statAmount}>{amount.toLocaleString('vi-VN')} đ</Text>
        </View>
    </View>
);

const CalendarInfoScreen = () => {
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const [selectedDate, setSelectedDate] = useState(todayUTC);

    const dailyStats = useMemo(() => {
   
        const dateString = selectedDate.toISOString().split('T')[0];
        
        const transactionsForDay = MOCK_TRANSACTIONS.filter(t => t.date === dateString);

        const income = transactionsForDay
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactionsForDay
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            total: income - expense,
        };
    }, [selectedDate]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Calendar onDateSelect={setSelectedDate} />

                <View style={styles.statsContainer}>
                    <StatBox label="Thu" amount={dailyStats.income} color="#DCFCE7" />
                    <StatBox label="Chi" amount={dailyStats.expense} color="#FEE2E2" />
                    <StatBox label="Tổng" amount={dailyStats.total} color="#E0E7FF" />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        paddingTop: scale(10),
    },
    statsContainer: {
        marginTop: scale(15),
        alignItems: 'center',
    },
    statBox: {
        width: '80%',
        marginVertical: scale(8),
        borderRadius: scale(20),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    statBoxContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(15),
        borderRadius: scale(20),
    },
    statLabel: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(20),
        color: '#333',
    },
    statAmount: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(18),
        color: '#555',
    },
});

export default CalendarInfoScreen;