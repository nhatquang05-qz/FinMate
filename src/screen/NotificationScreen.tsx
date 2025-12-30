import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
} from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scaling';
import { NotificationManager, NotificationItem } from '../utils/NotificationManager';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

interface NotificationScreenProps {
    onNavigateToReport: () => void;
}

const NotificationScreen = ({ onNavigateToReport }: NotificationScreenProps) => {
    const { colors, isDarkMode } = useTheme();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        const data = await NotificationManager.getNotifications();
        setNotifications(data);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handlePressItem = (item: NotificationItem) => {
        if (item.type === 'report') {
            onNavigateToReport();
        }
    };

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[styles.itemContainer, { backgroundColor: colors.card }]}
            onPress={() => handlePressItem(item)}
            activeOpacity={0.7}>
            <View
                style={[
                    styles.iconContainer,
                    { backgroundColor: isDarkMode ? '#333' : '#E0F7FA' },
                ]}>
                <Image
                    source={
                        item.type === 'success'
                            ? require('../assets/images/piggy-bank.png')
                            : require('../assets/images/pie-chart.png')
                    }
                    style={styles.itemIcon}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>{item.title}</Text>
                <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                    {format(new Date(item.date), 'HH:mm dd/MM/yyyy')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Chưa có thông báo nào
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: scale(15),
        paddingBottom: scale(100),
    },
    itemContainer: {
        flexDirection: 'row',
        borderRadius: scale(15),
        padding: scale(15),
        marginBottom: verticalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        alignItems: 'center',
    },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(15),
    },
    itemIcon: {
        width: scale(24),
        height: scale(24),
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(14),
        marginBottom: verticalScale(2),
    },
    message: {
        fontSize: moderateScale(13),
        marginBottom: verticalScale(5),
        lineHeight: verticalScale(18),
    },
    date: {
        fontSize: moderateScale(10),
        textAlign: 'right',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(16),
    },
});

export default NotificationScreen;
