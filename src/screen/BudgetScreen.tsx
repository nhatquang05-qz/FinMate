import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import { Category } from '../types/data';

interface BudgetScreenProps {
    onBack: () => void;
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ onBack }) => {
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [newLimit, setNewLimit] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get<Category[]>('/categories?type=expense');
            setCategories(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy danh mục:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách danh mục.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditBudget = (category: Category) => {
        setSelectedCategory(category);
        setNewLimit(category.budget_limit ? category.budget_limit.toString() : '0');
        setModalVisible(true);
    };

    const handleSaveBudget = async () => {
        if (!selectedCategory) return;

        const limitValue = parseFloat(newLimit);
        if (isNaN(limitValue) || limitValue < 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        try {
            await apiClient.put(`/categories/${selectedCategory.id}`, {
                name: selectedCategory.name,
                type: selectedCategory.type,
                icon: selectedCategory.icon,
                budget_limit: limitValue,
            });

            const updatedCategories = categories.map(cat =>
                cat.id === selectedCategory.id ? { ...cat, budget_limit: limitValue } : cat,
            );
            setCategories(updatedCategories);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã cập nhật hạn mức chi tiêu.');
        } catch (error) {
            console.error('Lỗi khi cập nhật budget:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật hạn mức.');
        }
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
            amount,
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleEditBudget(item)}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <View style={styles.iconPlaceholder} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.budgetLimit}>
                    Hạn mức:{' '}
                    {item.budget_limit && item.budget_limit > 0
                        ? formatCurrency(item.budget_limit)
                        : 'Chưa thiết lập'}
                </Text>
            </View>
            <Text style={styles.editButton}>Sửa</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.backText}>{'< Trở về'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hạn Mức Chi Tiêu</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 20 },
                    ]}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Không có danh mục chi tiêu nào.</Text>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Đặt hạn mức cho {selectedCategory?.name}
                        </Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={newLimit}
                            onChangeText={setNewLimit}
                            placeholder="Nhập số tiền (VNĐ)"
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveBudget}>
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(15),
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        zIndex: 10,
    },
    backButton: {
        padding: scale(5),
    },
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
    listContent: {
        padding: scale(15),
        paddingTop: scale(20),
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: scale(15),
        borderRadius: scale(15),
        marginBottom: verticalScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        marginRight: scale(15),
    },
    iconPlaceholder: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#E0F7FA',
    },
    infoContainer: {
        flex: 1,
    },
    categoryName: {
        fontSize: moderateScale(16),
        fontFamily: 'BeVietnamPro-Bold',
        color: '#333',
        lineHeight: moderateScale(24),
    },
    budgetLimit: {
        fontSize: moderateScale(13),
        fontFamily: 'BeVietnamPro-Regular',
        color: '#666',
        marginTop: verticalScale(4),
        lineHeight: moderateScale(18),
    },
    editButton: {
        color: '#04D1C1',
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(14),
        lineHeight: moderateScale(20),
    },
    emptyText: {
        textAlign: 'center',
        marginTop: verticalScale(20),
        color: '#999',
        fontFamily: 'BeVietnamPro-Regular',
        lineHeight: moderateScale(22),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: scale(20),
        padding: scale(20),
        width: '100%',
        maxWidth: 350,
        elevation: 5,
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontFamily: 'BeVietnamPro-Bold',
        marginBottom: verticalScale(20),
        textAlign: 'center',
        color: '#333',
        lineHeight: moderateScale(26),
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        paddingVertical: verticalScale(10),
        fontSize: moderateScale(16),
        marginBottom: verticalScale(25),
        fontFamily: 'BeVietnamPro-Regular',
        color: '#333',
        lineHeight: moderateScale(24),
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: verticalScale(12),
        borderRadius: scale(10),
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        marginRight: scale(10),
    },
    saveButton: {
        backgroundColor: '#04D1C1',
        marginLeft: scale(10),
    },
    cancelButtonText: {
        color: '#666',
        fontFamily: 'BeVietnamPro-Bold',
        lineHeight: moderateScale(20),
    },
    saveButtonText: {
        color: '#FFF',
        fontFamily: 'BeVietnamPro-Bold',
        lineHeight: moderateScale(20),
    },
});

export default BudgetScreen;
