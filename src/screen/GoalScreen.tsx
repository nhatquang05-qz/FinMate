import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale } from '../utils/scaling';
import apiClient from '../api/apiClient';
import CustomDatePickerModal from '../components/CustomDatePickerModal';
import { format, differenceInDays } from 'date-fns';
import { NotificationManager } from '../utils/NotificationManager';
import { useTheme } from '../context/ThemeContext';

interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
    color: string;
}

const GoalScreen = () => {
    const { colors, isDarkMode } = useTheme();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [goalDeadline, setGoalDeadline] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    const [addMoneyAmount, setAddMoneyAmount] = useState('');

    useEffect(() => {
        NotificationManager.requestPermissions();
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await apiClient.get('/goals');
            const formattedGoals = res.data.map((g: any) => ({
                ...g,
                target_amount: parseFloat(g.target_amount),
                current_amount: parseFloat(g.current_amount),
            }));
            setGoals(formattedGoals);
            NotificationManager.checkGoalDeadlines(formattedGoals);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setGoalName('');
        setGoalAmount('');
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        setGoalDeadline(nextMonth);
        setModalVisible(true);
    };

    const openEditModal = (item: Goal) => {
        setIsEditing(true);
        setEditingId(item.id);
        setGoalName(item.name);
        setGoalAmount(item.target_amount.toString());
        setGoalDeadline(new Date(item.deadline));
        setModalVisible(true);
    };

    const handleSaveGoal = async () => {
        if (!goalName || !goalAmount) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên và số tiền mục tiêu');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (goalDeadline < today) {
            Alert.alert('Ngày không hợp lệ', 'Hạn chót phải là ngày trong tương lai.');
            return;
        }

        const payload = {
            name: goalName,
            target_amount: parseFloat(goalAmount),
            deadline: format(goalDeadline, 'yyyy-MM-dd'),
            color: '#04D1C1',
            icon: 'piggy-bank',
        };

        try {
            if (isEditing && editingId) {
                await apiClient.put(`/goals/${editingId}`, payload);
                Alert.alert('Thành công', 'Đã cập nhật mục tiêu!');
            } else {
                await apiClient.post('/goals', payload);
                Alert.alert('Thành công', 'Đã tạo mục tiêu mới!');
            }
            setModalVisible(false);
            fetchGoals();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể lưu mục tiêu');
        }
    };

    const openAddMoneyModal = (id: number) => {
        setSelectedGoalId(id);
        setAddMoneyAmount('');
        setAddMoneyModalVisible(true);
    };

    const handleAddMoney = async () => {
        if (!selectedGoalId || !addMoneyAmount) return;
        try {
            const amountToAdd = parseFloat(addMoneyAmount);
            if (isNaN(amountToAdd) || amountToAdd <= 0) {
                Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
                return;
            }

            await apiClient.put(`/goals/${selectedGoalId}/add-money`, {
                amount: amountToAdd,
            });

            const goal = goals.find(g => g.id === selectedGoalId);
            if (goal) {
                const current = goal.current_amount;
                const target = goal.target_amount;
                const newAmount = current + amountToAdd;

                if (newAmount >= target && current < target) {
                    Alert.alert('🎉 CHÚC MỪNG!', `Bạn đã hoàn thành mục tiêu "${goal.name}"!`);
                    await NotificationManager.sendCongratulation(goal.name);
                } else {
                    Alert.alert('Thành công', 'Đã thêm tiền vào hũ!');
                }
            }

            setAddMoneyModalVisible(false);
            fetchGoals();
        } catch (e) {
            Alert.alert('Lỗi', 'Cập nhật thất bại');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xóa mục tiêu', 'Bạn có chắc chắn muốn xóa?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await apiClient.delete(`/goals/${id}`);
                        setModalVisible(false);
                        fetchGoals();
                    } catch (e) {
                        console.error(e);
                    }
                },
            },
        ]);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const renderItem = ({ item }: { item: Goal }) => {
        const progress =
            item.target_amount > 0
                ? Math.min((item.current_amount / item.target_amount) * 100, 100)
                : 0;

        const isCompleted = item.current_amount >= item.target_amount;
        const daysLeft = differenceInDays(new Date(item.deadline), new Date());

        const cardBg = isCompleted ? (isDarkMode ? '#332b00' : '#FFFBE6') : colors.card;
        const borderColor = isCompleted ? '#FFD700' : 'transparent';
        const titleColor = isCompleted ? '#B8860B' : colors.text;

        return (
            <TouchableOpacity
                style={[
                    styles.baseCard,
                    { backgroundColor: cardBg, borderColor, borderWidth: isCompleted ? 2 : 0 },
                ]}
                onPress={() => openAddMoneyModal(item.id)}
                onLongPress={() => openEditModal(item)}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.goalName, { color: titleColor }]}>
                            {item.name} {isCompleted && '🏆'}
                        </Text>
                        <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                            Hạn: {format(new Date(item.deadline), 'dd/MM/yyyy')}
                            {!isCompleted && daysLeft >= 0 && daysLeft <= 3 && (
                                <Text style={{ color: 'red', fontWeight: 'bold' }}> (Gấp!)</Text>
                            )}
                            {!isCompleted && daysLeft < 0 && (
                                <Text style={{ color: 'red' }}> (Quá hạn)</Text>
                            )}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => openEditModal(item)}
                        style={styles.editIconBtn}>
                        <Text style={{ fontSize: 20 }}>✏️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.amountRow}>
                    <Text style={[styles.amountText, { color: colors.primary }]}>
                        {formatCurrency(item.current_amount)}
                    </Text>
                    <Text style={[styles.targetText, { color: colors.textSecondary }]}>
                        / {formatCurrency(item.target_amount)}
                    </Text>
                </View>

                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: isCompleted
                                    ? '#FFD700'
                                    : item.color || colors.primary,
                            },
                        ]}
                    />
                </View>

                <View style={styles.cardFooter}>
                    <Text style={[styles.percentText, { color: colors.textSecondary }]}>
                        {Math.round(progress)}%
                    </Text>
                    <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                        {isCompleted ? 'Đã hoàn thành xuất sắc!' : 'Chạm để nạp thêm'}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerContainer}>
                <Text style={[styles.headerTitle, { color: colors.primary }]}>Hũ Tiết Kiệm</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={goals}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: scale(20), paddingBottom: scale(100) }}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            Bạn chưa có mục tiêu nào.
                        </Text>
                    }
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={openCreateModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {isEditing ? 'Chỉnh sửa mục tiêu' : 'Mục tiêu mới'}
                        </Text>

                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Tên mục tiêu
                        </Text>
                        <TextInput
                            placeholder="VD: Mua xe, Du lịch..."
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                { borderColor: colors.border, color: colors.text },
                            ]}
                            value={goalName}
                            onChangeText={setGoalName}
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Số tiền cần (VNĐ)
                        </Text>
                        <TextInput
                            placeholder="0"
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                { borderColor: colors.border, color: colors.text },
                            ]}
                            keyboardType="numeric"
                            value={goalAmount}
                            onChangeText={setGoalAmount}
                        />

                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Ngày kết thúc
                        </Text>
                        <TouchableOpacity
                            style={[styles.dateInput, { borderColor: colors.border }]}
                            onPress={() => setShowDatePicker(true)}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'BeVietnamPro-Regular',
                                    color: colors.text,
                                }}>
                                {format(goalDeadline, 'dd/MM/yyyy')}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                                (Còn {differenceInDays(goalDeadline, new Date())} ngày)
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtons}>
                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (editingId) handleDelete(editingId);
                                    }}
                                    style={styles.deleteButton}>
                                    <Text style={styles.deleteButtonText}>Xóa</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[
                                    styles.cancelButton,
                                    { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' },
                                ]}>
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                        { color: isDarkMode ? '#AAA' : '#666' },
                                    ]}>
                                    Hủy
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSaveGoal}
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <CustomDatePickerModal
                        visible={showDatePicker}
                        initialDate={goalDeadline}
                        minimumDate={new Date()}
                        onConfirm={date => {
                            setGoalDeadline(date);
                            setShowDatePicker(false);
                        }}
                        onClose={() => setShowDatePicker(false)}
                        mode="day"
                        useNativeModal={false}
                    />
                </View>
            </Modal>

            <Modal visible={addMoneyModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Nạp thêm tiền
                        </Text>
                        <TextInput
                            placeholder="Số tiền (VNĐ)"
                            placeholderTextColor={colors.textSecondary}
                            style={[
                                styles.input,
                                { borderColor: colors.border, color: colors.text },
                            ]}
                            keyboardType="numeric"
                            value={addMoneyAmount}
                            onChangeText={setAddMoneyAmount}
                            autoFocus={true}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => setAddMoneyModalVisible(false)}
                                style={[
                                    styles.cancelButton,
                                    { backgroundColor: isDarkMode ? '#333' : '#F0F0F0' },
                                ]}>
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                        { color: isDarkMode ? '#AAA' : '#666' },
                                    ]}>
                                    Hủy
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddMoney}
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                                <Text style={styles.saveButtonText}>Nạp ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: { marginTop: scale(10), marginBottom: scale(5) },
    headerTitle: {
        fontSize: scale(24),
        fontFamily: 'Coiny-Regular',
        textAlign: 'center',
    },

    baseCard: {
        borderRadius: scale(15),
        padding: scale(15),
        marginBottom: scale(15),
        elevation: 3,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: scale(5),
    },
    goalName: { fontSize: scale(18), fontFamily: 'BeVietnamPro-Bold' },
    deadlineText: {
        fontSize: scale(12),
        marginTop: 2,
        fontFamily: 'BeVietnamPro-Regular',
    },
    editIconBtn: { padding: 5, marginLeft: 10 },

    amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: scale(10) },
    amountText: { fontSize: scale(16), fontFamily: 'BeVietnamPro-Bold' },
    targetText: { fontSize: scale(14) },

    progressBarBg: {
        height: scale(10),
        borderRadius: scale(5),
        overflow: 'hidden',
    },
    progressBarFill: { height: '100%', borderRadius: scale(5) },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(5) },
    percentText: { fontSize: scale(14), fontFamily: 'BeVietnamPro-Bold' },
    hintText: { fontSize: scale(10), fontStyle: 'italic' },

    fab: {
        position: 'absolute',
        bottom: scale(130),
        right: scale(20),
        width: scale(56),
        height: scale(56),
        borderRadius: scale(28),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: { fontSize: scale(30), color: 'white', marginTop: -scale(4) },
    emptyText: { textAlign: 'center', marginTop: scale(50) },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: scale(20),
    },
    modalContent: {
        borderRadius: scale(20),
        padding: scale(20),
        elevation: 5,
    },
    modalTitle: {
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
        textAlign: 'center',
        marginBottom: scale(15),
    },
    label: {
        fontSize: scale(14),
        marginBottom: scale(5),
        marginLeft: scale(5),
        fontFamily: 'BeVietnamPro-SemiBold',
    },
    input: {
        borderWidth: 1,
        borderRadius: scale(10),
        padding: scale(12),
        marginBottom: scale(15),
        fontSize: scale(16),
        fontFamily: 'BeVietnamPro-Regular',
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: scale(10),
        padding: scale(12),
        marginBottom: scale(15),
        justifyContent: 'center',
    },

    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: scale(10) },
    cancelButton: {
        padding: scale(12),
        flex: 1,
        alignItems: 'center',
        borderRadius: scale(10),
        marginRight: scale(5),
    },
    cancelButtonText: { fontFamily: 'BeVietnamPro-Bold' },
    saveButton: {
        padding: scale(12),
        borderRadius: scale(10),
        flex: 1,
        alignItems: 'center',
        marginLeft: scale(5),
    },
    saveButtonText: { color: '#FFF', fontFamily: 'BeVietnamPro-Bold' },
    deleteButton: {
        backgroundColor: '#FFEBEE',
        padding: scale(12),
        borderRadius: scale(10),
        marginRight: scale(5),
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: { color: '#FF5252', fontFamily: 'BeVietnamPro-Bold' },
});

export default GoalScreen;
