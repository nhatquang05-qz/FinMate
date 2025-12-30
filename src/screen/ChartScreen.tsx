import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { scale, moderateScale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import { PieChart } from 'react-native-gifted-charts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import CustomDatePickerModal, { DatePickerMode } from '../components/CustomDatePickerModal';
import TransactionTypeToggle from '../components/TransactionTypeToggle';
import { NotificationManager } from '../utils/NotificationManager';
import { useTheme } from '../context/ThemeContext'; // Import theme

interface CategoryStats {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    budgetLimit?: number;
}
interface StatsData {
    summary: { totalIncome: number; totalExpense: number };
    expenseByCategory: CategoryStats[];
    incomeByCategory: CategoryStats[];
}
type PeriodType = 'week' | 'month' | 'year';
type ChartType = 'income' | 'expense';

const formatCurrency = (amount: any) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// Component con nhận props nên ta truyền thêm color text vào hoặc wrap nó
const StatisticsPieChart = ({ data, textColor }: { data: CategoryStats[]; textColor: string }) => {
    if (!data || data.length === 0) {
        return (
            <View style={{ padding: 20 }}>
                <Text style={[styles.noDataText, { color: textColor }]}>Không có dữ liệu</Text>
            </View>
        );
    }
    const total = data.reduce((acc, item) => acc + (parseFloat(item.totalAmount as any) || 0), 0);
    if (total === 0) {
        return (
            <View style={{ padding: 20 }}>
                <Text style={[styles.noDataText, { color: textColor }]}>Không có dữ liệu</Text>
            </View>
        );
    }
    const chartColors = ['#04D1C1', '#FFC107', '#28A745', '#DC3545', '#17A2B8', '#6F42C1'];
    const pieData = data.map((item, index) => ({
        value: parseFloat(item.totalAmount as any) || 0,
        color: chartColors[index % chartColors.length],
        text: `${Math.round(((parseFloat(item.totalAmount as any) || 0) / total) * 100)}%`,
    }));
    return (
        <View style={styles.chartWrapper}>
            <PieChart
                data={pieData}
                donut
                showText
                textColor="white" // Text trong biểu đồ vẫn để trắng cho dễ nhìn
                fontWeight="bold"
                radius={scale(70)}
                innerRadius={scale(35)}
                textSize={scale(12)}
                focusOnPress
            />
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={`${item.categoryId}_legend`} style={styles.legendItem}>
                        <View
                            style={[
                                styles.legendColor,
                                { backgroundColor: chartColors[index % chartColors.length] },
                            ]}
                        />
                        <Text style={[styles.legendText, { color: textColor }]} numberOfLines={1}>
                            {item.categoryName} ({pieData[index].text})
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const ChartScreen = ({ navigateToHistoryWithFilter }: any) => {
    const { colors } = useTheme(); // Use Theme
    const [period, setPeriod] = useState<PeriodType>('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [chartType, setChartType] = useState<ChartType>('expense');

    useEffect(() => {
        fetchStatistics();
    }, [period, selectedDate]);

    const fetchStatistics = async () => {
        setIsLoading(true);
        setStats(null);
        try {
            const params: any = { periodType: period, year: selectedDate.getFullYear() };
            if (period === 'month') {
                params.month = selectedDate.getMonth() + 1;
            } else if (period === 'week') {
                params.startDate = format(
                    startOfWeek(selectedDate, { weekStartsOn: 1 }),
                    'yyyy-MM-dd',
                );
                params.endDate = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            }
            const response = await apiClient.get<StatsData>('/transactions/statistics', { params });
            setStats(response.data);
            if (response.data && response.data.expenseByCategory) {
                NotificationManager.checkBudgetExceeded(response.data.expenseByCategory);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTimePickerText = () => {
        if (period === 'year') return `Năm ${format(selectedDate, 'yyyy')}`;
        if (period === 'month') return `Tháng ${format(selectedDate, 'MM/yyyy')}`;
        if (period === 'week') {
            const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
            const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
            return `Tuần: ${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
        }
        return '';
    };

    const datePickerMode: DatePickerMode = useMemo(() => {
        if (period === 'year') return 'year';
        if (period === 'month') return 'month';
        if (period === 'week') return 'week';
        return 'day';
    }, [period]);

    const dataForChart =
        chartType === 'expense' ? stats?.expenseByCategory : stats?.incomeByCategory;
    const detailCardTitle =
        chartType === 'expense' ? 'Chi tiết danh mục chi' : 'Chi tiết danh mục thu';
    const detailAmountStyle =
        chartType === 'expense' ? styles.detailAmountExpense : styles.detailAmountIncome;

    const renderBudgetBar = (item: CategoryStats) => {
        const limit = parseFloat(item.budgetLimit as any) || 0;
        const amount = parseFloat(item.totalAmount as any) || 0;
        if (chartType !== 'expense' || limit <= 0) return null;
        let budgetPercent = (amount / limit) * 100;
        let budgetColor = '#28A745';
        if (budgetPercent > 100) budgetColor = '#DC3545';
        else if (budgetPercent >= 80) budgetColor = '#FFC107';
        return (
            <View>
                <View style={[styles.budgetBg, { backgroundColor: colors.border }]}>
                    <View
                        style={[
                            styles.budgetFill,
                            {
                                width: `${Math.min(budgetPercent, 100)}%`,
                                backgroundColor: budgetColor,
                            },
                        ]}
                    />
                </View>
                <Text style={[styles.budgetText, { color: colors.textSecondary }]}>
                    Định mức: {formatCurrency(limit)} ({Math.round(budgetPercent)}%)
                </Text>
            </View>
        );
    };

    const renderDetailItem = (item: CategoryStats) => (
        <TouchableOpacity
            key={`detail_${item.categoryId}`}
            style={[styles.detailItem, { borderBottomColor: colors.border }]}
            onPress={() =>
                navigateToHistoryWithFilter({ categoryId: item.categoryId, type: chartType })
            }>
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 5,
                    }}>
                    <Text style={[styles.detailCategory, { color: colors.text }]}>
                        {item.categoryName}
                    </Text>
                    <Text style={[styles.detailAmount, detailAmountStyle]}>
                        {formatCurrency(item.totalAmount)}
                    </Text>
                </View>
                {renderBudgetBar(item)}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}>
                <View style={[styles.periodSelector, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            period === 'week' ? { backgroundColor: colors.primary } : null,
                        ]}
                        onPress={() => setPeriod('week')}>
                        <Text
                            style={[
                                styles.periodText,
                                { color: period === 'week' ? '#fff' : colors.text },
                            ]}>
                            Tuần
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            period === 'month' ? { backgroundColor: colors.primary } : null,
                        ]}
                        onPress={() => setPeriod('month')}>
                        <Text
                            style={[
                                styles.periodText,
                                { color: period === 'month' ? '#fff' : colors.text },
                            ]}>
                            Tháng
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.periodButton,
                            period === 'year' ? { backgroundColor: colors.primary } : null,
                        ]}
                        onPress={() => setPeriod('year')}>
                        <Text
                            style={[
                                styles.periodText,
                                { color: period === 'year' ? '#fff' : colors.text },
                            ]}>
                            Năm
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.timePickerButton, { backgroundColor: colors.card }]}
                    onPress={() => setPickerVisible(true)}>
                    <Text style={[styles.timePickerText, { color: colors.primary }]}>
                        {renderTimePickerText()}
                    </Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator
                        size="large"
                        color={colors.primary}
                        style={{ marginTop: 50 }}
                    />
                ) : stats ? (
                    <View>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                                <Text
                                    style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                                    Tổng Thu
                                </Text>
                                <Text style={styles.summaryIncome}>
                                    {formatCurrency(stats.summary.totalIncome)}
                                </Text>
                            </View>
                            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                <Text
                                    style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                                    Tổng Chi
                                </Text>
                                <Text style={styles.summaryExpense}>
                                    {formatCurrency(stats.summary.totalExpense)}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <TransactionTypeToggle
                                activeType={chartType}
                                onSelectionChange={setChartType}
                            />
                            <StatisticsPieChart data={dataForChart || []} textColor={colors.text} />
                        </View>

                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>
                                {detailCardTitle}
                            </Text>
                            {dataForChart && dataForChart.length > 0 ? (
                                dataForChart.map(renderDetailItem)
                            ) : (
                                <View style={{ padding: 10 }}>
                                    <Text
                                        style={[
                                            styles.noDataText,
                                            { color: colors.textSecondary },
                                        ]}>
                                        Không có dữ liệu
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <CustomDatePickerModal
                visible={isPickerVisible}
                initialDate={selectedDate}
                maximumDate={new Date()}
                onConfirm={date => {
                    setPickerVisible(false);
                    setSelectedDate(date);
                }}
                onClose={() => setPickerVisible(false)}
                mode={datePickerMode}
                useNativeModal={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollViewContent: {
        paddingHorizontal: scale(15),
        paddingBottom: scale(110),
        paddingTop: scale(10),
    },
    periodSelector: {
        flexDirection: 'row',
        borderRadius: scale(30),
        alignSelf: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    periodButton: {
        paddingVertical: scale(10),
        paddingHorizontal: scale(20),
        borderRadius: scale(30),
    },
    periodText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
        lineHeight: moderateScale(22),
    },
    timePickerButton: {
        padding: scale(12),
        borderRadius: scale(10),
        alignItems: 'center',
        marginTop: scale(15),
        marginBottom: scale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    timePickerText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),
        lineHeight: moderateScale(24),
    },
    card: {
        borderRadius: scale(20),
        padding: scale(15),
        marginBottom: scale(20),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    cardTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(18),
        marginBottom: scale(10),
        textAlign: 'center',
        lineHeight: moderateScale(26),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(10),
        borderBottomWidth: 1,
    },
    summaryLabel: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
        lineHeight: moderateScale(22),
    },
    summaryIncome: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),
        color: '#28A745',
        lineHeight: moderateScale(24),
    },
    summaryExpense: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),
        color: '#D9435E',
        lineHeight: moderateScale(24),
    },
    noDataText: {
        textAlign: 'center',
        padding: scale(20),
        fontFamily: 'BeVietnamPro-Regular',
        lineHeight: moderateScale(22),
    },
    detailItem: { paddingVertical: scale(12), borderBottomWidth: 1 },
    detailCategory: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
        lineHeight: moderateScale(22),
    },
    detailAmount: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
        lineHeight: moderateScale(22),
    },
    detailAmountExpense: { color: '#D9435E' },
    detailAmountIncome: { color: '#28A745' },
    chartWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(10),
        marginTop: scale(15),
    },
    legendContainer: { marginLeft: scale(20), justifyContent: 'center', flex: 1 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: scale(5) },
    legendColor: {
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        marginRight: scale(10),
    },
    legendText: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(13),
        flexShrink: 1,
        lineHeight: moderateScale(18),
    },
    budgetBg: {
        height: 6,
        borderRadius: 3,
        marginTop: 4,
        width: '100%',
    },
    budgetFill: { height: '100%', borderRadius: 3 },
    budgetText: {
        fontSize: 10,
        marginTop: 2,
        textAlign: 'right',
        fontStyle: 'italic',
        lineHeight: 14,
    },
});

export default ChartScreen;
