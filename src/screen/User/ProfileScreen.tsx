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
    Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from '../../utils/scaling';
import apiClient from '../../api/apiClient';
import * as ImagePicker from 'expo-image-picker';

const defaultAvatar = require('../../assets/images/user_avatar.png');

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
            console.error("Failed to fetch user profile:", error);
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
            console.error("Failed to update profile:", error);
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

    const renderField = (label: string, value: string, editable: boolean, onChangeText?: (text: string) => void) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            {editable ? (
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                />
            ) : (
                <Text style={styles.value}>{value}</Text>
            )}
        </View>
    );

    if (isLoading && !user) {
        return <ActivityIndicator size="large" color="#04D1C1" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                
                {/* KHÔI PHỤC NÚT QUAY LẠI CỦA BẠN (Dòng này đã bị tôi xóa nhầm) */}
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Quay lại</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Thông tin cá nhân</Text>
                
                <TouchableOpacity 
                    style={styles.avatarContainer} 
                    onPress={pickImage}
                    disabled={isUploading}
                >
                    <Image
                        source={user?.avatar_url ? { uri: user.avatar_url } : defaultAvatar}
                        style={styles.avatar}
                    />
                    <View style={styles.editIcon}>
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.editText}>Đổi</Text>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={styles.card}>
                    {renderField('Tên đăng nhập', user?.username || '', false)}
                    {renderField('Email', user?.email || '', false)}
                    {renderField('Họ và tên', isEditing ? editedFullName : user?.full_name || '', isEditing, setEditedFullName)}
                    {renderField('Ngày sinh', isEditing ? editedDob : (user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('vi-VN') : ''), isEditing, setEditedDob)}
                </View>

                {isEditing ? (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)} disabled={isLoading}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveTextChanges} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Lưu</Text>}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { 
        paddingHorizontal: scale(20),
        paddingTop: scale(20),
        paddingBottom: scale(120),  
    },
    backButton: { marginBottom: scale(20) },
    backButtonText: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(16), color: '#04D1C1' },
    title: { fontFamily: 'Coiny-Regular', fontSize: scale(28), color: '#04D1C1', textAlign: 'center', marginBottom: scale(20) },
    
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: scale(30),
    },
    avatar: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        borderWidth: 4,
        borderColor: '#fff',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#04D1C1',
        borderRadius: scale(20),
        width: scale(35),
        height: scale(35),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editText: {
        color: 'white',
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(12),
    },

    card: { backgroundColor: 'white', borderRadius: scale(20), padding: scale(20), elevation: 3, shadowOpacity: 0.1 },
    fieldContainer: { marginBottom: scale(20) },
    label: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(14), color: '#888', marginBottom: scale(5) },
    value: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(16), color: '#333' },
    input: { fontFamily: 'BeVietnamPro-Regular', fontSize: scale(16), color: '#333', borderBottomWidth: 1, borderBottomColor: '#04D1C1', paddingBottom: scale(5) },
    buttonContainer: { flexDirection: 'row', marginTop: scale(30) },
    button: { flex: 1, padding: scale(15), borderRadius: scale(30), alignItems: 'center' },
    editButton: { backgroundColor: '#E6FFFD', marginTop: scale(30) },
    editButtonText: { fontFamily: 'Coiny-Regular', color: '#04D1C1', fontSize: scale(18) },
    saveButton: { backgroundColor: '#04D1C1', marginLeft: scale(10) },
    saveButtonText: { fontFamily: 'Coiny-Regular', color: 'white', fontSize: scale(18) },
    cancelButton: { backgroundColor: '#F0F0F0', marginRight: scale(10) },
    cancelButtonText: { fontFamily: 'Coiny-Regular', color: '#555', fontSize: scale(18) },
});

export default ProfileScreen;