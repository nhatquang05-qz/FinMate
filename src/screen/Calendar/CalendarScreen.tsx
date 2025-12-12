import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { scale } from '../../utils/scaling';
import apiClient from '../../api/apiClient';
import { Transaction } from '../../types/data';
import TransactionItem from '../../components/TransactionItem';
import { format, addMonths, subMonths, isSameMonth, isAfter } from 'date-fns';

// Cấu hình tiếng Việt cho lịch
LocaleConfig.locales['vi'] = {
    monthNames: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ],
    dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
    dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
};
LocaleConfig.defaultLocale = 'vi';

// Kiểu dữ liệu từ API
interface CalendarData {
    summary: { totalIncome: number; totalExpense: number; balance: number };
    dailySummaries: {
        date: string;
        netAmount: number;
        totalIncome?: number;
        totalExpense?: number;
    }[];
    transactions: Transaction[];
}

// Định dạng tiền tệ
const formatCurrency = (amount: number, short = false) => {
    // an toàn: nếu amount không phải số -> trả 0₫
    const num = Number(amount || 0);
    if (isNaN(num)) return '0 ₫';
    if (short) {
        if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (Math.abs(num) >= 1_000) return `${Math.round(num / 1_000)}K`;
        return `${num}`;
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

const CalendarScreen = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const today = new Date();

    useEffect(() => {
        fetchData();
    }, [currentMonth]);

    const fetchData = async () => {
        setIsLoading(true);
        setCalendarData(null);
        try {
            const month = currentMonth.getMonth() + 1;
            const year = currentMonth.getFullYear();
            const response = await apiClient.get<CalendarData>(
                `/transactions/calendar-view?month=${month}&year=${year}`,
            );
            setCalendarData(response.data);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDayPress = (day: { dateString: string }) => {
        setSelectedDate(prev => (prev === day.dateString ? null : day.dateString));
    };

    // Custom render từng ngày (không thay style)
    const dayComponent = ({ date }: { date?: DateData }) => {
        if (!date) return null;

        const thisDate = new Date(date.dateString);
        const currentMonthNum = currentMonth.getMonth();
        const isFuture = thisDate > today;
        const isOtherMonth = thisDate.getMonth() !== currentMonthNum;
        const isToday = format(thisDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

        const day = calendarData?.dailySummaries.find(
            d => format(new Date(d.date), 'yyyy-MM-dd') === date.dateString,
        );

        const isSelected = selectedDate === date.dateString;
        const amount = day ? formatCurrency(day.netAmount, true) : '';
        const color = day ? (day.netAmount < 0 ? '#D9435E' : '#28A745') : '#999';

        // Disable touch for future or other month
        const disabled = isFuture || isOtherMonth;

        return (
            <TouchableOpacity
                onPress={() => !disabled && handleDayPress(date)}
                activeOpacity={disabled ? 1 : 0.7}
                style={[
                    styles.dayContainer,
                    isSelected && styles.daySelectedOutline,
                    !isSelected && isToday && styles.todayOutline,
                    disabled && styles.dayDisabled,
                ]}>
                <Text
                    style={[
                        styles.dayText,
                        {
                            color: disabled ? '#ccc' : isSelected ? '#04D1C1' : '#000',
                            fontFamily: isSelected ? 'BeVietnamPro-Bold' : 'BeVietnamPro-Regular',
                        },
                    ]}>
                    {date.day}
                </Text>

                <View style={{ height: scale(14), justifyContent: 'center' }}>
                    {!!amount && (
                        <Text
                            style={[
                                styles.amountText,
                                { color: disabled ? '#ccc' : isSelected ? '#04D1C1' : color },
                            ]}>
                            {amount}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const transactionsToShow = useMemo(() => {
        if (!selectedDate) return calendarData?.transactions || [];
        return (
            calendarData?.transactions.filter(
                t => format(new Date(t.transaction_date), 'yyyy-MM-dd') === selectedDate,
            ) || []
        );
    }, [calendarData, selectedDate]);

    // ---- helper: phân loại giao dịch thành income/expense robust ----
    const classifyAndSum = (txs: (Transaction & Record<string, any>)[]) => {
        let income = 0;
        let expense = 0;

        for (const t of txs) {
            const rawAmount = t.amount;
            const amt = Number(rawAmount || 0);
            const typeHint = (
                (t.type || t.transaction_type || t.txn_type || '') + ''
            ).toLowerCase();

            // If explicit sign
            if (!isNaN(amt) && amt < 0) {
                expense += Math.abs(amt);
                continue;
            }
            if (!isNaN(amt) && amt > 0) {
                // But check if type says expense (some APIs store positive amounts for expenses)
                if (
                    typeHint.includes('exp') ||
                    typeHint.includes('chi') ||
                    typeHint.includes('withdraw') ||
                    typeHint.includes('debit')
                ) {
                    expense += Math.abs(amt);
                } else {
                    income += amt;
                }
                continue;
            }

            // amt is 0 or NaN: use type hint
            if (
                typeHint.includes('exp') ||
                typeHint.includes('chi') ||
                typeHint.includes('withdraw') ||
                typeHint.includes('debit')
            ) {
                expense += Math.abs(amt || 0);
            } else {
                income += amt || 0;
            }
        }

        return { income, expense, balance: income - expense };
    };

    // ✅ Logic tính tổng hiển thị: ưu tiên dailySummaries, fallback transactions (robust)
    const displayedSummary = useMemo(() => {
        if (!calendarData) return { totalIncome: 0, totalExpense: 0, balance: 0 };

        // nếu chưa chọn ngày -> hiển thị tổng tháng từ API (an toàn)
        if (!selectedDate) {
            return {
                totalIncome: Number(calendarData.summary?.totalIncome) || 0,
                totalExpense: Number(calendarData.summary?.totalExpense) || 0,
                balance: Number(calendarData.summary?.balance) || 0,
            };
        }

        // tìm day summary trong API
        const day = calendarData.dailySummaries.find(
            d => format(new Date(d.date), 'yyyy-MM-dd') === selectedDate,
        );

        if (day) {
            // nếu API cung cấp totalIncome/totalExpense cho ngày thì dùng (an toàn)
            const tInc = Number((day as any).totalIncome);
            const tExp = Number((day as any).totalExpense);
            if (!isNaN(tInc) || !isNaN(tExp)) {
                const totalIncome = !isNaN(tInc) ? tInc : day.netAmount > 0 ? day.netAmount : 0;
                const totalExpense = !isNaN(tExp)
                    ? tExp
                    : day.netAmount < 0
                      ? Math.abs(day.netAmount)
                      : 0;
                return {
                    totalIncome: totalIncome || 0,
                    totalExpense: totalExpense || 0,
                    balance: (totalIncome || 0) - (totalExpense || 0),
                };
            }
            // nếu chỉ có netAmount, fallback: try compute from transactions (below)
        }

        // fallback: tính từ transactions của ngày (với phân loại linh hoạt)
        const dailyTxs =
            calendarData.transactions.filter(
                t => format(new Date(t.transaction_date), 'yyyy-MM-dd') === selectedDate,
            ) || [];

        const sums = classifyAndSum(dailyTxs);
        return {
            totalIncome: sums.income || 0,
            totalExpense: sums.expense || 0,
            balance: sums.balance || 0,
        };
    }, [calendarData, selectedDate]);

    // Logic chuyển tháng (giữ nguyên)
    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1);
        const isFutureMonth =
            nextMonth.getFullYear() > today.getFullYear() ||
            (nextMonth.getFullYear() === today.getFullYear() &&
                nextMonth.getMonth() > today.getMonth());

        if (!isFutureMonth) {
            setCurrentMonth(nextMonth);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: scale(150) }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handlePrevMonth}>
                        <Text style={styles.arrow}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {`Tháng ${currentMonth.getMonth() + 1}\\${currentMonth.getFullYear()}`}
                    </Text>
                    <TouchableOpacity
                        onPress={handleNextMonth}
                        disabled={
                            currentMonth.getFullYear() > today.getFullYear() ||
                            (currentMonth.getFullYear() === today.getFullYear() &&
                                currentMonth.getMonth() >= today.getMonth())
                        }>
                        <Text
                            style={[
                                styles.arrow,
                                currentMonth.getFullYear() > today.getFullYear() ||
                                (currentMonth.getFullYear() === today.getFullYear() &&
                                    currentMonth.getMonth() >= today.getMonth())
                                    ? { opacity: 0.3 }
                                    : null,
                            ]}>
                            {'>'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 50 }} />
                ) : (
                    calendarData && (
                        <>
                            {/* Summary */}
                            <View style={styles.summaryContainer}>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Tổng Thu</Text>
                                    <Text style={[styles.summaryAmount, styles.income]}>
                                        {formatCurrency(displayedSummary.totalIncome)}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Tổng Chi</Text>
                                    <Text style={[styles.summaryAmount, styles.expense]}>
                                        {formatCurrency(displayedSummary.totalExpense)}
                                    </Text>
                                </View>
                                <View style={styles.summaryItem}>
                                    <Text style={styles.summaryLabel}>Chênh lệch</Text>
                                    <Text
                                        style={[
                                            styles.summaryAmount,
                                            displayedSummary.balance >= 0
                                                ? styles.income
                                                : styles.expense,
                                        ]}>
                                        {formatCurrency(displayedSummary.balance)}
                                    </Text>
                                </View>
                            </View>

                            {/* Calendar */}
                            <Calendar
                                current={format(currentMonth, 'yyyy-MM-dd')}
                                onMonthChange={month => setCurrentMonth(new Date(month.timestamp))}
                                dayComponent={dayComponent}
                                markingType="custom"
                                theme={{
                                    arrowColor: '#04D1C1',
                                    todayTextColor: '#04D1C1',
                                    textDayFontFamily: 'BeVietnamPro-Regular',
                                    textMonthFontFamily: 'Coiny-Regular',
                                    textDayHeaderFontFamily: 'BeVietnamPro-Bold',
                                    textDayHeaderFontWeight: 'bold',
                                }}
                            />

                            {/* Transaction List */}
                            <Text style={styles.listTitle}>
                                {selectedDate
                                    ? `Giao dịch ngày ${format(new Date(selectedDate), 'dd/MM/yyyy')}`
                                    : 'Tất cả giao dịch trong tháng'}
                            </Text>

                            <FlatList
                                data={transactionsToShow}
                                renderItem={({ item }) => <TransactionItem item={item} />}
                                keyExtractor={item => item.id.toString()}
                                scrollEnabled={false}
                                ListEmptyComponent={() => (
                                    <Text style={styles.emptyText}>Không có giao dịch.</Text>
                                )}
                                style={{ marginHorizontal: scale(15) }}
                            />
                        </>
                    )
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// STYLE (không thay đổi)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(15),
    },
    headerTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(22),
        color: '#04D1C1',
    },
    arrow: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(24),
        color: '#04D1C1',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: scale(10),
        backgroundColor: '#fff',
        marginHorizontal: scale(15),
        borderRadius: scale(10),
        elevation: 2,
        marginBottom: scale(10),
    },
    summaryItem: { alignItems: 'center' },
    summaryLabel: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(12),
        color: '#888',
    },
    summaryAmount: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(14) },
    income: { color: '#28A745' },
    expense: { color: '#D9435E' },
    balance: { color: '#007BFF' },
    listTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(18),
        color: '#333',
        marginTop: scale(20),
        marginBottom: scale(10),
        marginHorizontal: scale(15),
    },
    emptyText: {
        textAlign: 'center',
        fontFamily: 'BeVietnamPro-Regular',
        marginTop: scale(20),
        color: '#888',
    },
    dayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(12),
        width: scale(50),
        height: scale(58),
        marginVertical: scale(2),
    },

    daySelectedOutline: {
        borderWidth: 2,
        borderColor: '#04D1C1',
        backgroundColor: '#04D1C120',
    },

    todayOutline: {
        borderWidth: 1.5,
        borderColor: '#ccc',
    },

    dayDisabled: {
        opacity: 0.3,
    },

    dayText: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(13),
    },

    amountText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(10),
        lineHeight: scale(12),
        marginTop: scale(2),
    },
});

export default CalendarScreen;
