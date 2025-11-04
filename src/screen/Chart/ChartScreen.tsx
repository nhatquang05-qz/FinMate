import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from '../../utils/scaling';
import apiClient from '../../api/apiClient';
import { PieChart } from "react-native-gifted-charts";
import DatePicker from 'react-native-date-picker';
import { format, startOfWeek, endOfWeek } from 'date-fns';


// Import component Toggle đã có
import TransactionTypeToggle from '../../components/TransactionTypeToggle/TransactionTypeToggle';

// Định nghĩa kiểu dữ liệu
interface CategoryStats {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
}
interface StatsData {
  summary: { totalIncome: number; totalExpense: number; };
  expenseByCategory: CategoryStats[];
  incomeByCategory: CategoryStats[];
}
type PeriodType = 'week' | 'month' | 'year';
type ChartType = 'income' | 'expense';

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Component con cho biểu đồ tròn
const StatisticsPieChart = ({ data }: { data: CategoryStats[] }) => {
    if (!data || data.length === 0) {
        return <Text style={styles.noDataText}>Không có dữ liệu</Text>;
    }

    const total = data.reduce((acc, item) => acc + item.totalAmount, 0);
    if (total === 0) return <Text style={styles.noDataText}>Không có dữ liệu</Text>;

    const chartColors = ['#04D1C1', '#FFC107', '#28A745', '#DC3545', '#17A2B8', '#6F42C1'];

    const pieData = data.map((item, index) => ({
        value: item.totalAmount,
        color: chartColors[index % chartColors.length],
        text: `${Math.round((item.totalAmount / total) * 100)}%`,
    }));

    return (
        <View style={styles.chartWrapper}>
            <PieChart
                data={pieData}
                donut
                showText
                textColor="white"
                fontWeight="bold"
                radius={scale(70)}
                innerRadius={scale(35)}
                textSize={scale(12)}
                focusOnPress
            />
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={item.categoryName} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: chartColors[index % chartColors.length] }]} />
                        <Text style={styles.legendText} numberOfLines={1}>{item.categoryName} ({pieData[index].text})</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const ChartScreen = () => {
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
        params.startDate = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        params.endDate = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      }

      const response = await apiClient.get<StatsData>('/transactions/statistics', { params });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
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
      return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
    }
    return '';
  };

  const dataForChart = chartType === 'expense' ? stats?.expenseByCategory : stats?.incomeByCategory;
  const detailCardTitle = chartType === 'expense' ? 'Chi tiết danh mục chi' : 'Chi tiết danh mục thu';
  const detailAmountStyle = chartType === 'expense' ? styles.detailAmountExpense : styles.detailAmountIncome;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
            <TouchableOpacity style={[styles.periodButton, period === 'week' && styles.activePeriod]} onPress={() => setPeriod('week')}><Text style={[styles.periodText, period === 'week' && styles.activeText]}>Tuần</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.periodButton, period === 'month' && styles.activePeriod]} onPress={() => setPeriod('month')}><Text style={[styles.periodText, period === 'month' && styles.activeText]}>Tháng</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.periodButton, period === 'year' && styles.activePeriod]} onPress={() => setPeriod('year')}><Text style={[styles.periodText, period === 'year' && styles.activeText]}>Năm</Text></TouchableOpacity>
        </View>

        {/* Time Picker */}
        <TouchableOpacity style={styles.timePickerButton} onPress={() => setPickerVisible(true)}>
            <Text style={styles.timePickerText}>{renderTimePickerText()}</Text>
        </TouchableOpacity>

        {isLoading ? <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 50 }} /> : (
            stats && (
                <>
                    {/* Summary Card */}
                    <View style={styles.card}>
                        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tổng Thu</Text><Text style={styles.summaryIncome}>{formatCurrency(stats.summary.totalIncome)}</Text></View>
                        <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}><Text style={styles.summaryLabel}>Tổng Chi</Text><Text style={styles.summaryExpense}>{formatCurrency(stats.summary.totalExpense)}</Text></View>
                    </View>

                    {/* Chart Card */}
                    <View style={styles.card}>
                        <TransactionTypeToggle activeType={chartType} onSelectionChange={(type) => setChartType(type)} />
                        <StatisticsPieChart data={dataForChart || []} />
                    </View>
                    
                    {/* Detail List */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{detailCardTitle}</Text>
                        {dataForChart && dataForChart.length > 0 ? (
                            dataForChart.map(item => (
                                <TouchableOpacity key={item.categoryId} style={styles.detailItem}>
                                    <View style={{flex: 1, marginRight: 10}}>
                                        <Text style={styles.detailCategory} numberOfLines={1}>{item.categoryName}</Text>
                                        <Text style={styles.detailCount}>{item.transactionCount} giao dịch</Text>
                                    </View>
                                    <Text style={[styles.detailAmount, detailAmountStyle]}>{formatCurrency(item.totalAmount)}</Text>
                                </TouchableOpacity>
                            ))
                        ) : <Text style={styles.noDataText}>Không có dữ liệu</Text>}
                    </View>
                </>
            )
        )}
      </ScrollView>

      <DatePicker
        modal
        open={isPickerVisible}
        date={selectedDate}
        mode="date"
        onConfirm={(date) => {
          setPickerVisible(false);
          setSelectedDate(date);
        }}
        onCancel={() => setPickerVisible(false)}
        title="Chọn thời gian"
        confirmText="Xác nhận"
        cancelText="Hủy"
        locale="vi-VN"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollViewContent: {
        padding: scale(15),
        paddingBottom: scale(120)
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#fff',
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
    activePeriod: {
        backgroundColor: '#04D1C1',
    },
    periodText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
        color: '#333',
    },
    activeText: {
        color: '#fff',
    },
    timePickerButton: {
        backgroundColor: '#fff',
        padding: scale(12),
        borderRadius: scale(10),
        alignItems: 'center',
        marginVertical: scale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    timePickerText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),
        color: '#04D1C1',
    },
    card: {
        backgroundColor: 'white',
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
        color: '#333',
        marginBottom: scale(10),
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    summaryLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15), color: '#555' },
    summaryIncome: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(16), color: '#28A745' },
    summaryExpense: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(16), color: '#D9435E' },
    noDataText: {
        textAlign: 'center',
        padding: scale(20),
        fontFamily: 'BeVietnamPro-Regular',
        color: '#888',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: scale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    detailCategory: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15), color: '#333' },
    detailCount: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(12), color: '#888' },
    detailAmount: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15) },
    detailAmountExpense: { color: '#D9435E' },
    detailAmountIncome: { color: '#28A745' },
    chartWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: scale(10),
        marginTop: scale(15),
    },
    legendContainer: {
        marginLeft: scale(20),
        justifyContent: 'center',
        flex: 1, 
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: scale(5),
    },
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
    },
});

export default ChartScreen;