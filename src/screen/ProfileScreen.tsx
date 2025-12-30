import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

const defaultAvatar = require('../assets/images/user_avatar.png');

interface UserProfile {
    id: number;
    username: string;
    email: string;
    full_name: string;
    date_of_birth: string;
    avatar_url: string | null;
}

interface ProfileScreenProps {
    onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
    const { colors, isDarkMode } = useTheme();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [editedFullName, setEditedFullName] = useState('');
    const [editedDob, setEditedDob] = useState('');

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<UserProfile>('/users/profile');
            setUser(response.data);
            setEditedFullName(response.data.full_name);
            setEditedDob(new Date(response.data.date_of_birth).toISOString().split('T')[0]);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveTextChanges = async () => {
        setIsLoading(true);
        try {
            await apiClient.put('/users/profile', {
                fullName: editedFullName,
                dateOfBirth: editedDob,
            });
            Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
            await fetchUserProfile();
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin.');
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Chúng tôi cần quyền truy cập thư viện ảnh!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            await uploadAvatar(result.assets[0].uri);
        }
    };

    const uploadAvatar = async (uri: string) => {
        setIsUploading(true);

        const formData = new FormData();
        const filename = uri.split('/').pop() || 'avatar.jpg';

        formData.append('avatar', {
            uri: uri,
            name: filename,
            type: 'image/jpeg',
        } as any);

        try {
            const response = await apiClient.patch('/users/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUser(prev => ({
                ...prev!,
                avatar_url: response.data.avatarURL,
            }));

            Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
        } catch (error) {
            console.error('Avatar upload failed:', error);
            Alert.alert('Lỗi', 'Cập nhật ảnh đại diện thất bại.');
        } finally {
            setIsUploading(false);
        }
    };

    const renderField = (
        label: string,
        value: string,
        editable: boolean,
        onChangeText?: (text: string) => void,
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            {editable ? (
                <TextInput
                    style={[
                        styles.input,
                        { color: colors.text, borderBottomColor: colors.primary },
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                />
            ) : (
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            )}
        </View>
    );

    if (isLoading && !user) {
        return (
            <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ flex: 1, justifyContent: 'center' }}
            />
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: colors.primary }]}>
                        ‹ Quay lại
                    </Text>
                </TouchableOpacity>

                <Text style={[styles.title, { color: colors.primary }]}>Thông tin cá nhân</Text>

                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={pickImage}
                    disabled={isUploading}>
                    <Image
                        source={user?.avatar_url ? { uri: user.avatar_url } : defaultAvatar}
                        style={[styles.avatar, { borderColor: colors.card }]}
                    />
                    <View
                        style={[
                            styles.editIcon,
                            { backgroundColor: colors.primary, borderColor: colors.card },
                        ]}>
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.editText}>Đổi</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    {renderField('Tên đăng nhập', user?.username || '', false)}
                    {renderField('Email', user?.email || '', false)}
                    {renderField(
                        'Họ và tên',
                        isEditing ? editedFullName : user?.full_name || '',
                        isEditing,
                        setEditedFullName,
                    )}
                    {renderField(
                        'Ngày sinh',
                        isEditing
                            ? editedDob
                            : user?.date_of_birth
                              ? new Date(user.date_of_birth).toLocaleDateString('vi-VN')
                              : '',
                        isEditing,
                        setEditedDob,
                    )}
                </View>

                {isEditing ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' },
                            ]}
                            onPress={() => setIsEditing(false)}
                            disabled={isLoading}>
                            <Text
                                style={[
                                    styles.cancelButtonText,
                                    { color: isDarkMode ? '#AAA' : '#555' },
                                ]}>
                                Hủy
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.saveButton,
                                { backgroundColor: colors.primary },
                            ]}
                            onPress={handleSaveTextChanges}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.editButton,
                            { backgroundColor: isDarkMode ? '#1E3A3A' : '#E6FFFD' },
                        ]}
                        onPress={() => setIsEditing(true)}>
                        <Text style={[styles.editButtonText, { color: colors.primary }]}>
                            Chỉnh sửa
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
        paddingBottom: scale(120),
    },
    backButton: { marginBottom: scale(20) },
    backButtonText: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(16) },
    title: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(28),
        textAlign: 'center',
        marginBottom: scale(20),
    },

    avatarContainer: {
        alignSelf: 'center',
        marginBottom: scale(30),
    },
    avatar: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        borderWidth: 4,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderRadius: scale(20),
        width: scale(35),
        height: scale(35),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    editText: {
        color: 'white',
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(12),
    },

    card: {
        borderRadius: scale(20),
        padding: scale(20),
        elevation: 3,
        shadowOpacity: 0.1,
    },
    fieldContainer: { marginBottom: scale(20) },
    label: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(14),
        marginBottom: scale(5),
    },
    value: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(16) },
    input: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(16),
        borderBottomWidth: 1,
        paddingBottom: scale(5),
    },
    buttonContainer: { flexDirection: 'row', marginTop: scale(30) },
    button: { flex: 1, padding: scale(15), borderRadius: scale(30), alignItems: 'center' },
    editButton: { marginTop: scale(30) },
    editButtonText: { fontFamily: 'Coiny-Regular', fontSize: scale(18) },
    saveButton: { marginLeft: scale(10) },
    saveButtonText: { fontFamily: 'Coiny-Regular', color: 'white', fontSize: scale(18) },
    cancelButton: { marginRight: scale(10) },
    cancelButtonText: { fontFamily: 'Coiny-Regular', fontSize: scale(18) },
});

export default ProfileScreen;
