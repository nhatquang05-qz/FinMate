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
import apiClient from '../../api/apiClient';
import { scale, moderateScale, verticalScale } from '../../utils/scaling';
import { iconMap } from '../../utils/iconMap';
import { format } from 'date-fns';

const RecurringListScreen = ({ onBack }: { onBack: () => void }) => {
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
            fetchData();
        }
    };

    const deleteItem = (id: number) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa lịch này không?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(`/transactions/recurring/${id}`);
                        setData(data.filter(item => item.id !== id));
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa');
                    }
                },
            },
        ]);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
            amount,
        );
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const iconSource = iconMap[item.category_icon] || iconMap.default;
        const nextDate = new Date(item.next_run_date);

        return (
            <View style={[styles.card, !item.is_active && styles.cardInactive]}>
                <View style={styles.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.iconContainer}>
                            <Image source={iconSource} style={styles.icon} />
                        </View>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text style={styles.categoryName} numberOfLines={1}>
                                {item.category_name}
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
                        value={!!item.is_active}
                        onValueChange={() => toggleStatus(item.id, index)}
                        trackColor={{ false: '#767577', true: '#04D1C1' }}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>Kỳ tới: {format(nextDate, 'dd/MM/yyyy')}</Text>
                    <TouchableOpacity
                        onPress={() => deleteItem(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.deleteText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
                {item.note ? (
                    <Text style={styles.note} numberOfLines={2}>
                        {item.note}
                    </Text>
                ) : null}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Trở về'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Định kỳ</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Chưa có giao dịch định kỳ nào</Text>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(15),
        backgroundColor: '#FFF',
        elevation: 2,
        zIndex: 10,
    },
    backButton: { padding: scale(5) },
    backText: {
        fontSize: moderateScale(14),
        color: '#04D1C1',
        fontFamily: 'BeVietnamPro-Bold',
        lineHeight: moderateScale(20),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'Coiny-Regular',
        color: '#333',
        lineHeight: moderateScale(26),
    },
    list: { padding: scale(15), paddingTop: scale(20) },
    card: {
        backgroundColor: 'white',
        borderRadius: scale(15),
        padding: scale(15),
        marginBottom: verticalScale(15),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    cardInactive: { opacity: 0.6, backgroundColor: '#FAFAFA' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#E0F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(10),
    },
    icon: { width: scale(24), height: scale(24), resizeMode: 'contain' },
    categoryName: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(16),
        color: '#333',
        lineHeight: moderateScale(24),
    },
    amount: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(15),
        lineHeight: moderateScale(22),
    },
    expense: { color: '#FF5252' },
    income: { color: '#04D1C1' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: verticalScale(10) },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    dateText: { fontFamily: 'BeVietnamPro-Regular', color: '#666', lineHeight: moderateScale(20) },
    deleteText: {
        fontFamily: 'BeVietnamPro-Bold',
        color: '#FF5252',
        lineHeight: moderateScale(20),
    },
    note: { marginTop: 5, fontSize: 12, color: '#999', fontStyle: 'italic', lineHeight: 16 },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontFamily: 'BeVietnamPro-Regular',
        lineHeight: 20,
    },
});

export default RecurringListScreen;
