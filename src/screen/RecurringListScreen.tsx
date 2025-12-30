import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Switch,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { scale, moderateScale, verticalScale } from '../utils/scaling';
import { iconMap } from '../utils/iconMap';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const RecurringListScreen = ({ onBack }: { onBack: () => void }) => {
    const { colors, isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await apiClient.get('/transactions/recurring');
            setData(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: number, index: number) => {
        try {
            const newData = [...data];
            newData[index].is_active = !newData[index].is_active;
            setData(newData);
            await apiClient.patch(`/transactions/recurring/${id}/toggle`);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const deleteRecurring = (id: number) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xoá khoản này?', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xoá',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(`/transactions/recurring/${id}`);
                        setData(data.filter(i => i.id !== id));
                    } catch (error) {
                        Alert.alert('Lỗi', 'Xoá thất bại');
                    }
                },
            },
        ]);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const iconSource = iconMap[item.category_icon] || require('../assets/images/money.png');

        return (
            <View
                style={[
                    styles.card,
                    { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#000' },
                ]}>
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: isDarkMode ? '#333' : '#E0F7FA' },
                            ]}>
                            <Image source={iconSource} style={styles.icon} />
                        </View>
                        <View>
                            <Text style={[styles.categoryName, { color: colors.text }]}>
                                {item.category_name ||
                                    (item.type === 'income' ? 'Thu nhập' : 'Chi tiêu')}
                            </Text>
                            <Text
                                style={[
                                    styles.amount,
                                    item.type === 'expense' ? styles.expense : styles.income,
                                ]}>
                                {item.type === 'expense' ? '-' : '+'}
                                {formatCurrency(item.amount)}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={item.is_active}
                        onValueChange={() => toggleStatus(item.id, index)}
                        trackColor={{ false: '#767577', true: colors.primary }}
                        thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                    />
                </View>

                {item.note && (
                    <Text style={[styles.note, { color: colors.textSecondary }]}>
                        Ghi chú: {item.note}
                    </Text>
                )}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.cardFooter}>
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        Ngày bắt đầu: {format(new Date(item.start_date), 'dd/MM/yyyy')}
                    </Text>
                    <TouchableOpacity onPress={() => deleteRecurring(item.id)}>
                        <Text style={styles.deleteText}>Xoá</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, backgroundColor: colors.background },
            ]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={[styles.backText, { color: colors.primary }]}>{'< Quay lại'}</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Định kỳ</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Chưa có khoản định kỳ nào
                        </Text>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(15),
        paddingBottom: verticalScale(10),
        borderBottomWidth: 1,
    },
    backButton: { padding: 5 },
    backText: { fontSize: moderateScale(16), fontFamily: 'BeVietnamPro-Bold' },
    title: { fontSize: moderateScale(20), fontFamily: 'Coiny-Regular' },
    list: { padding: scale(15) },
    card: {
        borderRadius: scale(15),
        padding: scale(15),
        marginBottom: verticalScale(15),
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    icon: { width: scale(24), height: scale(24), resizeMode: 'contain' },
    categoryName: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(16),
        lineHeight: moderateScale(24),
    },
    amount: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(15),
        lineHeight: moderateScale(22),
    },
    expense: { color: '#FF5252' },
    income: { color: '#04D1C1' },
    divider: { height: 1, marginVertical: verticalScale(10) },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    dateText: { fontFamily: 'BeVietnamPro-Regular', lineHeight: moderateScale(20) },
    deleteText: {
        fontFamily: 'BeVietnamPro-Bold',
        color: '#FF5252',
        lineHeight: moderateScale(20),
    },
    note: { marginTop: 5, fontStyle: 'italic', fontSize: 12 },
    emptyText: { textAlign: 'center', marginTop: 20, fontFamily: 'BeVietnamPro-Regular' },
});

export default RecurringListScreen;
