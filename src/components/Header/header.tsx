import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { scale } from '../../utils/scaling';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenTitles: { [key: string]: string } = {
    Home: 'Trang chủ',
    Money: 'Nhập',
    Calendar: 'Lịch',
    Chart: 'Thống kê',
    User: 'Tài khoản',
    Notification: 'Thông báo',
    Setting: 'Cài đặt',
};

interface HeaderProps {
    activeTab: string;
    onNotificationPress?: () => void;
}

const Header = ({ activeTab, onNotificationPress }: HeaderProps) => {
    const title = screenTitles[activeTab] || 'Trang chủ';
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.headerContainer,
                {
                    height: scale(60) + insets.top,
                    paddingTop: insets.top,
                },
            ]}>
            <View style={styles.placeholder} />
            <View style={styles.titleContainer}>
                <Text
                    style={styles.headerTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.5}>
                    {title}
                </Text>
            </View>
            <View style={styles.rightIconContainer}>
                <TouchableOpacity
                    style={styles.iconWrapper}
                    onPress={onNotificationPress}
                    activeOpacity={0.7}>
                    <Image source={require('./notification-icon.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFF',
        paddingHorizontal: scale(10),
    },
    placeholder: {
        flex: 1,
    },
    titleContainer: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    headerTitle: {
        fontFamily: 'Coiny-Regular',
        textAlign: 'center',
        fontSize: scale(30),
        color: '#04D1C1',
    },
    rightIconContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    iconWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(12),
        padding: scale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(4) },
        shadowOpacity: 0.1,
        shadowRadius: scale(5),
        elevation: scale(5),
    },
    icon: {
        width: scale(24),
        height: scale(24),
    },
});

export default Header;
