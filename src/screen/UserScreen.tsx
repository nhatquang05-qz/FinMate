import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { scale, moderateScale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationManager } from '../utils/NotificationManager';
import { useTheme } from '../context/ThemeContext';

const userAvatar = require('../assets/images/user_avatar.png');

interface UserProfile {
    id: number;
    username: string;
    email: string;
    full_name: string;
    date_of_birth: string;
    avatar_url: string | null;
}

interface UserScreenProps {
    onLogout: () => void;
    navigateToSubScreen: (screenName: string) => void;
    onNavigateToSettings: () => void;
}

const UserScreen: React.FC<UserScreenProps> = ({
    onLogout,
    navigateToSubScreen,
    onNavigateToSettings,
}) => {
    const { colors, isDarkMode, toggleTheme } = useTheme();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get<UserProfile>('/users/profile');
                setUser(response.data);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const notiStatus = await AsyncStorage.getItem('user_notifications_enabled');
                setNotificationsEnabled(notiStatus === 'true');
            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };
        loadSettings();
    }, []);

    const toggleNotification = async () => {
        const newState = !notificationsEnabled;
        setNotificationsEnabled(newState);

        try {
            await AsyncStorage.setItem('user_notifications_enabled', String(newState));

            if (newState) {
                const success = await NotificationManager.scheduleDailyReminder();
                if (!success) {
                    Alert.alert(
                        'Lưu ý',
                        'Đã bật tính năng, nhưng ứng dụng chưa có quyền gửi thông báo. Vui lòng kiểm tra Cài đặt điện thoại.',
                    );
                }
            } else {
                await NotificationManager.cancelAllNotifications();
            }
        } catch (error) {
            console.error('Error toggling notification:', error);
            Alert.alert('Lỗi', 'Không thể lưu cài đặt.');
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileHeader}>
                    <Image
                        source={user?.avatar_url ? { uri: user.avatar_url } : userAvatar}
                        style={styles.avatar}
                    />
                    <Text style={[styles.userName, { color: colors.primary }]}>
                        {user?.full_name || 'User'}
                    </Text>
                </View>

                <View style={styles.menuContainer}>
                    {}
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={() => navigateToSubScreen('Profile')}>
                        <Text style={[styles.menuText, { color: colors.text }]}>
                            Thông tin cá nhân
                        </Text>
                        <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
                    </TouchableOpacity>

                    {}
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={() => navigateToSubScreen('Recurring')}>
                        <Text style={[styles.menuText, { color: colors.text }]}>
                            Quản lý thu chi định kỳ
                        </Text>
                        <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
                    </TouchableOpacity>

                    {}
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: colors.card }]}
                        onPress={onNavigateToSettings}>
                        <Text style={[styles.menuText, { color: colors.text }]}>
                            Quản lý cài đặt
                        </Text>
                        <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
                    </TouchableOpacity>

                    {}
                    <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
                        <Text style={[styles.menuText, { color: colors.text }]}>Thông báo</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81e9e1' }}
                            thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleNotification}
                            value={notificationsEnabled}
                        />
                    </View>

                    {}
                    <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
                        <Text style={[styles.menuText, { color: colors.text }]}>Chế độ tối</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81e9e1' }}
                            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleTheme}
                            value={isDarkMode}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: colors.primary }]}
                    onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    scrollViewContent: {
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
        paddingBottom: scale(120),
    },
    profileHeader: { alignItems: 'center', marginBottom: scale(30) },
    avatar: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        marginBottom: scale(15),
    },
    userName: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(24),

        lineHeight: moderateScale(30),
    },
    menuContainer: { marginBottom: scale(40) },
    menuItem: {
        borderRadius: scale(30),
        paddingVertical: scale(15),
        paddingHorizontal: scale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(15),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    menuText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),

        lineHeight: moderateScale(24),
    },
    arrow: {
        fontSize: scale(24),

        lineHeight: moderateScale(28),
    },
    logoutButton: {
        borderRadius: scale(30),
        paddingVertical: scale(15),
        marginHorizontal: scale(50),
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    logoutButtonText: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(18),
        color: 'white',
        lineHeight: moderateScale(24),
    },
});

export default UserScreen;
