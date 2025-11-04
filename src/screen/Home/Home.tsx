import React, {useState, useEffect } from 'react';
import {
    SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { scale } from '../../utils/scaling';
import apiClient from '../../api/apiClient';
import { Transaction, SummaryData, PieChartData } from '../../types/data';
import TransactionItem from '../../components/TransactionItem';
import { PieChart } from "react-native-gifted-charts";

// Hàm định dạng tiền tệ
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Component con cho biểu đồ
const PieChartComponent = ({ data }: { data: PieChartData[] }) => {
    if (!data || data.length === 0) {
        return <Text style={styles.noDataText}>Không có dữ liệu chi tiêu cho tháng này</Text>;
    }

    const total = data.reduce((acc, item) => acc + item.totalAmount, 0);
    const chartColors = ['#04D1C1', '#FFC107', '#28A745', '#DC3545', '#17A2B8'];

    const pieData = data.map((item, index) => ({
        value: item.totalAmount,
        color: chartColors[index % chartColors.length],
        text: `${Math.round((item.totalAmount / total) * 100)}%`,
    }));

    return (
        <View style={styles.chartContainer}>
            <PieChart
                data={pieData}
                donut
                showText
                textColor="black"
                radius={scale(80)}
                innerRadius={scale(40)}
                textSize={scale(14)}
                focusOnPress
            />
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={item.categoryName} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: chartColors[index % chartColors.length] }]} />
                        <Text style={styles.legendText}>{item.categoryName} ({pieData[index].text})</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

type MonthData = { year: number, month: number };

type HomeScreenProps = { navigateTo: (screenName: string) => void; };

const HomeScreen = ({ navigateTo }: HomeScreenProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
    const [pieData, setPieData] = useState<PieChartData[]>([]);
    const [availableMonths, setAvailableMonths] = useState<MonthData[]>([]);

    // Lấy danh sách các tháng có dữ liệu (chỉ chạy 1 lần)
    useEffect(() => {
        const fetchAvailableMonths = async () => {
            try {
                const res = await apiClient.get<MonthData[]>('/transactions/months-with-data');
                setAvailableMonths(res.data);
            } catch (error) {
                console.error("Failed to fetch available months:", error);
            }
        };
        fetchAvailableMonths();
    }, []);

    // Lấy dữ liệu chi tiết cho tháng được chọn
    useEffect(() => {
        if (availableMonths.length > 0) {
            fetchData();
        } else {
            setIsLoading(false); // Không có dữ liệu gì cả
        }
    }, [currentDate, availableMonths]); // Chạy lại khi tháng thay đổi

    const fetchData = async () => {
        setIsLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        try {
            const [summaryRes, transactionsRes, pieRes] = await Promise.all([
                apiClient.get(`/transactions/summary?month=${month}&year=${year}`),
                apiClient.get('/transactions/recent'),
                apiClient.get(`/transactions/report/pie-chart?month=${month}&year=${year}`)
            ]);
            setSummary(summaryRes.data);
            setRecentTransactions(transactionsRes.data);
            setPieData(pieRes.data);
        } catch (error) {
            console.error("Failed to fetch home screen data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const changeMonth = (direction: -1 | 1) => {
        const currentIndex = availableMonths.findIndex(
            m => m.year === currentDate.getFullYear() && m.month === currentDate.getMonth() + 1
        );

        if (direction === 1) { // Next month
            if (currentIndex > 0) {
                const nextMonthData = availableMonths[currentIndex - 1];
                setCurrentDate(new Date(nextMonthData.year, nextMonthData.month - 1));
            }
        } else { // Previous month
            if (currentIndex < availableMonths.length - 1 && currentIndex !== -1) {
                const prevMonthData = availableMonths[currentIndex + 1];
                setCurrentDate(new Date(prevMonthData.year, prevMonthData.month - 1));
            }
        }
    };

    const isNextDisabled = () => {
        const now = new Date();
        return currentDate.getFullYear() >= now.getFullYear() && currentDate.getMonth() >= now.getMonth();
    };

    const isPrevDisabled = () => {
        if (availableMonths.length === 0) return true;
        const lastMonthWithData = availableMonths[availableMonths.length - 1];
        return currentDate.getFullYear() <= lastMonthWithData.year && currentDate.getMonth() + 1 <= lastMonthWithData.month;
    };
    
    const monthYearString = `Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.scrollViewContent}>
                    {/* Quản lý */}
                    <View style={styles.sectionContainer}>
                                            <Text style={styles.sectionTitle}>Quản lý</Text>
                                            <View style={styles.card}>
                                                <View style={styles.managementIconsContainer}>
                                                    <TouchableOpacity onPress={() => navigateTo('Money')}>
                                                        <Image source={require('./AddTrans.png')} style={styles.managementIcon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => navigateTo('History')}>
                                                        <Image source={require('./History.png')} style={styles.managementIcon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => navigateTo('Statistic')}>
                                                        <Image source={require('./Statistic.png')} style={styles.managementIcon} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={() => navigateTo('Setting')}>
                                                        <Image source={require('./Setting.png')} style={styles.managementIcon} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                    
                    {isLoading ? <ActivityIndicator size="large" color="#04D1C1" /> : (
                        <>
                            {/* Tổng quan tháng này */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Tổng quan {monthYearString}</Text>
                                <View style={styles.card}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Tổng Thu</Text>
                                        <Text style={styles.summaryAmountIncome}>{formatCurrency(summary?.totalIncome || 0)}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Tổng Chi</Text>
                                        <Text style={styles.summaryAmountExpense}>{formatCurrency(summary?.totalExpense || 0)}</Text>
                                    </View>
                                    <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                                        <Text style={styles.summaryLabel}>Số dư</Text>
                                        <Text style={styles.summaryAmountBalance}>{formatCurrency(summary?.balance || 0)}</Text>
                                    </View>
                                </View>
                            </View>
                            {/* Biểu đồ chi tiêu */}
                        <View style={styles.sectionContainer}>
                            {/* << 1. SỬA LỖI KHOẢNG CÁCH TIÊU ĐỀ >> */}
                            <Text style={styles.sectionTitle}>Biểu đồ chi tiêu</Text>
                            <View style={styles.monthSelector}>
                                <TouchableOpacity onPress={() => changeMonth(-1)} disabled={isPrevDisabled()}>
                                    <Text style={[styles.arrow, isPrevDisabled() && styles.arrowDisabled]}>{'<'}</Text>
                                </TouchableOpacity>
                                <Text style={styles.monthYearText}>{`Tháng ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`}</Text>
                                <TouchableOpacity onPress={() => changeMonth(1)} disabled={isNextDisabled()}>
                                    <Text style={[styles.arrow, isNextDisabled() && styles.arrowDisabled]}>{'>'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.card, styles.chartCard]}>
                                <PieChartComponent data={pieData} />
                            </View>
                        </View>

                            {/* Giao dịch gần đây */}
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
                                <View style={[styles.card, { paddingTop: 0 }]}>
                                    {recentTransactions.length > 0 ? (
                                        <>
                                            {recentTransactions.map(item => <TransactionItem key={item.id} item={item} />)}
                                            <TouchableOpacity style={styles.viewMoreButton} onPress={() => navigateTo('History')}>
                                                <Text style={styles.viewMoreText}>Xem thêm</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <Text style={styles.noDataText}>Chưa có giao dịch nào</Text>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
        paddingBottom: scale(120)
    },
    sectionContainer: {
        marginBottom: scale(20),
    },
    sectionTitle: {
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
        color: '#04D1C1',
        marginBottom: scale(10),
        marginLeft: scale(5),
        lineHeight: scale(25),
    },
    card: {
        backgroundColor: 'white',
        borderRadius: scale(20),
        padding: scale(15),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    managementIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    managementIcon: {
        width: scale(55),
        height: scale(55),
        resizeMode: 'contain',
    },
    statisticCard: {
        backgroundColor: '#E6FFFD',
        borderRadius: scale(15),
        padding: scale(15),
        marginRight: scale(15),
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: scale(180),
    },
    statisticIcon: {
        width: scale(40),
        height: scale(40),
        resizeMode: 'contain',
        marginRight: scale(10),
    },
    statisticTextContainer: {
        flexDirection: 'column',
    },
    statisticCategory: {
        fontSize: scale(14),
        fontFamily: 'Coiny-Regular',
        color: '#333',
        lineHeight: scale(20),
    },
    statisticAmount: {
        fontSize: scale(16),
        fontFamily: 'Coiny-Regular',
        color: '#04D1C1',
    },
    chartCard: {
        height: scale(200),
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: { textAlign: 'center', padding: scale(20), fontFamily: 'BeVietnamPro-Regular' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: scale(10), borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    summaryLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(15) },
    summaryAmountIncome: { fontFamily: 'Coiny-Regular', fontSize: scale(16), color: '#28A745' },
    summaryAmountExpense: { fontFamily: 'Coiny-Regular', fontSize: scale(16), color: '#D9435E' },
    summaryAmountBalance: { fontFamily: 'Coiny-Regular', fontSize: scale(16), color: '#007BFF' },
    monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    arrow: { fontSize: scale(24), fontFamily: 'Coiny-Regular', color: '#04D1C1', paddingHorizontal: scale(10) },
    chartContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
    legendContainer: { marginLeft: scale(20) },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: scale(4) },
    legendColor: { width: scale(12), height: scale(12), borderRadius: scale(6), marginRight: scale(8) },
    legendText: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(13) },
        viewMoreButton: {
        marginTop: scale(15),
        paddingVertical: scale(5),
        alignItems: 'center',
    },
    viewMoreText: {
        fontFamily: 'BeVietnamPro-Bold',
        color: '#04D1C1',
        fontSize: scale(14),
    },
    arrowDisabled: {
        color: '#A0A0A0',
    },
    monthYearContainer: {
        flexDirection: 'column', 
        alignItems: 'center' ,
    },
    monthYearText: {
        fontSize: scale(18),
        fontFamily: 'Coiny-Regular',
        color: '#04D1C1',
    },
});