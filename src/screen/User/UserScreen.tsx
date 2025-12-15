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
} from 'react-native';
import { scale, moderateScale } from '../../utils/scaling';
import apiClient from '../../api/apiClient';

const userAvatar = require('../../assets/images/user_avatar.png');

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

    const handleLogout = () => {
        onLogout();
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color="#04D1C1" style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.profileHeader}>
                    <Image
                        source={user?.avatar_url ? { uri: user.avatar_url } : userAvatar}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateToSubScreen('Profile')}>
                        <Text style={styles.menuText}>Thông tin cá nhân</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigateToSubScreen('Recurring')}>
                        <Text style={styles.menuText}>Quản lý thu chi định kỳ</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={onNavigateToSettings}>
                        <Text style={styles.menuText}>Quản lý cài đặt</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                    <View style={styles.menuItem}>
                        <Text style={styles.menuText}>Thông báo</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81e9e1' }}
                            thumbColor={notificationsEnabled ? '#04D1C1' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() =>
                                setNotificationsEnabled(previousState => !previousState)
                            }
                            value={notificationsEnabled}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
        color: '#04D1C1',
        lineHeight: moderateScale(30),
    },
    menuContainer: { marginBottom: scale(40) },
    menuItem: {
        backgroundColor: 'white',
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
        color: '#333',
        lineHeight: moderateScale(24),
    },
    arrow: { fontSize: scale(24), color: '#04D1C1', lineHeight: moderateScale(28) },
    logoutButton: {
        backgroundColor: '#04D1C1',
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
