import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Switch,
    Alert,
} from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import CategoryPicker from '../../components/CategoryPicker';
import Detail from './detail';
import PopupSuccess from '../../components/popups/PopupSuccess';
import PopupFailed from '../../components/popups/PopupFailed';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { iconMap } from '../../utils/iconMap';
import { Category } from '../../types/data';
import { NotificationManager } from '../../utils/NotificationManager';
import apiClient from '../../api/apiClient';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';

const AddTransactionExpense = () => {
    const {
        categories,
        selectedCategory,
        date,
        amount,
        note,
        isLoading: hookLoading,
        isSuccessVisible,
        isFailedVisible,
        setSelectedCategory,
        setDate,
        setAmount,
        setNote,
        handleSave,
        handleSuccessClose,
        setFailedVisible,
    } = useTransactionForm('expense');

    const [isRecurring, setIsRecurring] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isSuccessVisible) {
            const catName = selectedCategory?.name || 'Khoản chi';
            NotificationManager.addNotification(
                'Nhập thành công',
                `Bạn vừa thêm khoản chi "${catName}" với số tiền ${amount}đ.`,
                'success',
            );
        }
    }, [isSuccessVisible]);

    const formattedCategories = categories.map((cat: Category) => ({
        ...cat,
        icon: iconMap[cat.icon] || iconMap.default,
    }));

    const formattedSelectedCategory =
        formattedCategories.find(c => c.id === selectedCategory?.id) || null;

    const pickAndScanImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để quét hóa đơn.');
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (pickerResult.canceled) {
                return;
            }

            setIsScanning(true);
            const imageUri = pickerResult.assets[0].uri;

            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'receipt.jpg',
            } as any);

            const scanRes = await apiClient.post('/receipts/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (scanRes.data.success) {
                const text = scanRes.data.data;
                processScannedText(text);
                Alert.alert("Thành công", "Đã quét thông tin từ hóa đơn!");
            } else {
                Alert.alert("Lỗi", "Không thể đọc nội dung hóa đơn.");
            }

        } catch (error) {
            console.error("Scan error:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra khi quét hóa đơn.");
        } finally {
            setIsScanning(false);
        }
    };

    const processScannedText = (text: string) => {
        const moneyRegex = /\d{1,3}(?:[.,]\d{3})+(?:\.\d+)?/g;
        const potentialAmounts = text.match(moneyRegex);

        if (potentialAmounts && potentialAmounts.length > 0) {
            const validAmounts = potentialAmounts.map(s => {
                const cleanStr = s.replace(/[^\d]/g, ''); 
                return parseInt(cleanStr, 10);
            });
            
            const maxAmount = Math.max(...validAmounts);
            
            if (maxAmount > 0) {
                const formattedAmount = maxAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setAmount(formattedAmount);
            }
        }

        setNote("Hóa đơn quét tự động");
    };

    const handleCustomSave = async () => {
        if (isRecurring) {
            if (!amount || !selectedCategory) {
                Alert.alert('Lỗi', 'Vui lòng nhập số tiền và chọn danh mục');
                return;
            }
            setLocalLoading(true);
            try {
                const payload = {
                    amount: parseFloat(amount.replace(/\./g, '').replace(/,/g, '')),
                    type: 'expense',
                    transaction_date: date,
                    note: note,
                    category_id: selectedCategory.id,
                    start_date: format(date, 'yyyy-MM-dd'),
                };

                await apiClient.post('/transactions/recurring', payload);

                Alert.alert('Thành công', 'Đã tạo lịch giao dịch tự động hàng tháng!');

                setAmount('');
                setNote('');
                setIsRecurring(false);
                setSelectedCategory(null);
            } catch (error) {
                console.error(error);
                Alert.alert('Lỗi', 'Không thể lưu giao dịch định kỳ');
            } finally {
                setLocalLoading(false);
            }
        } else {
            handleSave();
        }
    };

    const isLoading = hookLoading || localLoading || isScanning;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: verticalScale(200) }}
                showsVerticalScrollIndicator={false}>
                
                <TouchableOpacity 
                    style={styles.scanButton} 
                    onPress={pickAndScanImage}
                    disabled={isLoading}
                >
                    {isScanning ? (
                        <ActivityIndicator size="small" color="#04D1C1" />
                    ) : (
                        <Text style={styles.scanButtonText}>📸 Quét Hóa Đơn</Text>
                    )}
                </TouchableOpacity>

                <Detail
                    date={date}
                    onDateChange={setDate}
                    amount={amount}
                    onAmountChange={setAmount}
                    note={note}
                    onNoteChange={setNote}
                />

                <View style={styles.recurringContainer}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Lặp lại hàng tháng</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#04D1C1' }}
                            value={isRecurring}
                            onValueChange={setIsRecurring}
                        />
                    </View>
                    {isRecurring ? (
                        <Text style={styles.hint}>
                            Giao dịch sẽ tự động tạo vào ngày {date.getDate()} hàng tháng.
                        </Text>
                    ) : null}
                </View>

                <View style={styles.shadowbox}>
                    <Text style={styles.categoryTitle}>Chọn danh mục</Text>
                </View>

                <CategoryPicker
                    categories={formattedCategories}
                    selectedCategory={formattedSelectedCategory}
                    onSelectCategory={category => {
                        const originalCategory = categories.find(c => c.id === category.id);
                        if (originalCategory) {
                            setSelectedCategory(originalCategory);
                        }
                    }}
                />
            </ScrollView>

            <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleCustomSave}
                    disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Nhập</Text>
                    )}
                </TouchableOpacity>
            </View>

            <PopupSuccess visible={isSuccessVisible} onClose={handleSuccessClose} />
            <PopupFailed visible={isFailedVisible} onClose={() => setFailedVisible(false)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        paddingHorizontal: moderateScale(20),
        paddingTop: verticalScale(10),
    },
    scanButton: {
        alignSelf: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: moderateScale(15),
        backgroundColor: '#fff',
        borderRadius: scale(20),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: '#04D1C1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    scanButtonText: {
        color: '#04D1C1',
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(14),
    },
    shadowbox: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFF',
        borderRadius: scale(20),
        padding: scale(5),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: verticalScale(25),
        marginBottom: verticalScale(15),
    },
    categoryTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(17),
        color: '#000000ff',
    },
    saveButtonContainer: {
        bottom: scale(110),
        width: '35%',
        alignSelf: 'center',
        position: 'absolute',
    },
    saveButton: {
        backgroundColor: '#04D1C1',
        borderRadius: moderateScale(30),
        paddingVertical: verticalScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
    },
    recurringContainer: {
        marginTop: verticalScale(15),
        backgroundColor: '#fff',
        padding: scale(15),
        borderRadius: scale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: moderateScale(16),
        fontFamily: 'BeVietnamPro-Bold',
        color: '#04D1C1',
    },
    hint: {
        fontSize: moderateScale(12),
        color: '#888',
        fontStyle: 'italic',
        marginTop: 5,
        fontFamily: 'BeVietnamPro-Regular',
    },
});

export default AddTransactionExpense;