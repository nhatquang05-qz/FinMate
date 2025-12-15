import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import { scale, moderateScale, verticalScale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { iconMap } from '../utils/iconMap';
import { Image } from 'react-native';

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCalendarData();
    }, [month, year]);

    const fetchCalendarData = async () => {
        try {
            const res = await apiClient.get('/transactions/calendar-view', {
                params: { month, year },
            });
            setData(res.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const onMonthChange = (date: any) => {
        setMonth(date.month);
        setYear(date.year);
        setIsLoading(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
            amount,
        );
    };

    const getMarkedDates = () => {
        if (!data?.dailySummaries) return {};
        const marked: any = {};
        data.dailySummaries.forEach((day: any) => {
            const dateStr = format(new Date(day.date), 'yyyy-MM-dd');
            marked[dateStr] = {
                marked: true,
                dotColor: day.netAmount >= 0 ? '#28A745' : '#DC3545',
            };
        });
        marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: '#04D1C1',
        };
        return marked;
    };

    const selectedDayData = data?.dailySummaries?.find(
        (d: any) => format(new Date(d.date), 'yyyy-MM-dd') === selectedDate,
    );
    const selectedDayTransactions = data?.transactions?.filter(
        (t: any) => format(new Date(t.transaction_date), 'yyyy-MM-dd') === selectedDate,
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.calendarContainer}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day: any) => setSelectedDate(day.dateString)}
                        onMonthChange={onMonthChange}
                        markedDates={getMarkedDates()}
                        theme={{
                            todayTextColor: '#04D1C1',
                            arrowColor: '#04D1C1',
                            textDayFontFamily: 'BeVietnamPro-Regular',
                            textMonthFontFamily: 'BeVietnamPro-Bold',
                            textDayHeaderFontFamily: 'BeVietnamPro-Bold',
                        }}
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.detailsContainer}>
                        <View style={styles.summaryCard}>
                            <Text style={styles.dateTitle}>
                                Ngày {format(new Date(selectedDate), 'dd/MM/yyyy')}
                            </Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tổng kết ngày:</Text>
                                <Text
                                    style={[
                                        styles.summaryValue,
                                        {
                                            color:
                                                (selectedDayData?.netAmount || 0) >= 0
                                                    ? '#28A745'
                                                    : '#DC3545',
                                        },
                                    ]}>
                                    {formatCurrency(selectedDayData?.netAmount || 0)}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Giao dịch</Text>
                        {selectedDayTransactions && selectedDayTransactions.length > 0 ? (
                            selectedDayTransactions.map((t: any) => (
                                <View key={t.id} style={styles.transactionItem}>
                                    <Text style={styles.transCategory}>{t.category_name}</Text>
                                    <Text
                                        style={[
                                            styles.transAmount,
                                            t.type === 'expense' ? styles.expense : styles.income,
                                        ]}>
                                        {t.type === 'expense' ? '-' : '+'}
                                        {formatCurrency(t.amount)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>Không có giao dịch nào</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: { paddingBottom: scale(100) },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: scale(15),
        margin: scale(15),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        padding: scale(5),
    },
    detailsContainer: { paddingHorizontal: scale(15) },
    summaryCard: {
        backgroundColor: 'white',
        padding: scale(15),
        borderRadius: scale(15),
        marginBottom: scale(15),
        elevation: 2,
    },
    dateTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(16),
        color: '#333',
        marginBottom: 5,
        lineHeight: moderateScale(24),
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLabel: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
    },
    summaryValue: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(16),
        lineHeight: moderateScale(22),
    },
    sectionTitle: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(16),
        marginBottom: 10,
        color: '#555',
        lineHeight: moderateScale(24),
    },
    transactionItem: {
        backgroundColor: 'white',
        padding: scale(15),
        borderRadius: scale(10),
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transCategory: {
        fontFamily: 'BeVietnamPro-Bold',
        color: '#333',
        lineHeight: moderateScale(20),
    },
    transAmount: { fontFamily: 'BeVietnamPro-Bold', lineHeight: moderateScale(20) },
    expense: { color: '#DC3545' },
    income: { color: '#28A745' },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 10,
        fontFamily: 'BeVietnamPro-Regular',
        lineHeight: moderateScale(20),
    },
});

export default CalendarScreen;
