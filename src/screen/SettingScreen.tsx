import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { scale, moderateScale, verticalScale } from '../utils/scaling';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportToExcel } from '../utils/ExcelExporter';
import { useTheme } from '../context/ThemeContext';

interface SettingScreenProps {
    onNavigateToBudget?: () => void;
    onBack?: () => void;
}

const SettingItem = ({
    title,
    icon,
    isSwitch,
    value,
    onToggle,
    isDestructive,
    hideArrow,
    isLoading,
    colors,
    isDarkMode,
}: any) => (
    <TouchableOpacity
        style={styles.itemContainer}
        onPress={isSwitch ? onToggle : onToggle}
        disabled={isSwitch || isLoading}
        activeOpacity={0.7}>
        <View style={styles.leftContent}>
            <View
                style={[
                    styles.iconPlaceholder,
                    isDestructive
                        ? styles.destructiveIcon
                        : { backgroundColor: isDarkMode ? '#333' : '#E0F7FA' },
                ]}>
                {}
            </View>
            <Text
                style={[
                    styles.itemText,
                    isDestructive ? styles.destructiveText : { color: colors.text },
                ]}>
                {title}
            </Text>
        </View>

        {isSwitch ? (
            <Switch
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={onToggle}
                value={value}
            />
        ) : isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : (
            !hideArrow && <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
        )}
    </TouchableOpacity>
);

const SettingScreen: React.FC<SettingScreenProps> = ({ onNavigateToBudget, onBack }) => {
    const { colors, isDarkMode } = useTheme();

    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const toggleNotification = () => setIsNotificationEnabled(previousState => !previousState);

    const toggleBiometrics = () => {
        if (!isBiometricsEnabled) {
            Alert.alert(
                'Thông báo',
                'Tính năng bảo mật vân tay/FaceID sẽ được kích hoạt trong phiên bản tiếp theo.',
            );
        }
        setIsBiometricsEnabled(previousState => !previousState);
    };

    const handleExportData = async () => {
        setIsExporting(true);
        setTimeout(async () => {
            try {
                await exportToExcel();
            } catch (e) {
                console.error(e);
                Alert.alert('Lỗi', 'Xuất file thất bại');
            } finally {
                setIsExporting(false);
            }
        }, 100);
    };

    const handleClearData = async () => {
        Alert.alert(
            'Xóa dữ liệu',
            'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu cục bộ không? Hành động này không thể hoàn tác.',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.multiRemove([
                                'user_notifications',
                                'user_notifications_enabled',
                                'last_report_check',
                            ]);
                            Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm ứng dụng.');
                        } catch (e) {
                            console.error(e);
                        }
                    },
                },
            ],
        );
    };

    const itemProps = { colors, isDarkMode };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: colors.primary }]}>
                            ‹ Quay lại
                        </Text>
                    </TouchableOpacity>
                )}

                {}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Chung</Text>
                <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                    <SettingItem
                        title="Hạn mức chi tiêu (Budget)"
                        onToggle={onNavigateToBudget}
                        {...itemProps}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <SettingItem
                        title="Nhắc nhở nhập liệu hàng ngày"
                        isSwitch={true}
                        value={isNotificationEnabled}
                        onToggle={toggleNotification}
                        {...itemProps}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <SettingItem
                        title="Bảo mật vân tay / FaceID"
                        isSwitch={true}
                        value={isBiometricsEnabled}
                        onToggle={toggleBiometrics}
                        {...itemProps}
                    />
                </View>

                {}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dữ liệu</Text>
                <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                    <SettingItem
                        title="Xuất dữ liệu (Excel)"
                        onToggle={handleExportData}
                        isLoading={isExporting}
                        {...itemProps}
                    />
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                    <SettingItem
                        title="Xóa bộ nhớ đệm"
                        onToggle={handleClearData}
                        isDestructive={true}
                        hideArrow={true}
                        {...itemProps}
                    />
                </View>

                {}
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Thông tin ứng dụng
                </Text>
                <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                    <SettingItem
                        title="Phiên bản"
                        onToggle={() => {}}
                        hideArrow={true}
                        {...itemProps}
                    />
                    <View style={styles.versionContainer}>
                        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                            v1.0.0
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: scale(20),
        paddingBottom: verticalScale(100),
        paddingTop: verticalScale(40),
    },
    backButton: {
        marginBottom: verticalScale(10),
    },
    backButtonText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: moderateScale(16),
    },
    sectionTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(16),
        marginBottom: verticalScale(10),
        marginTop: verticalScale(10),
        marginLeft: scale(10),
    },
    sectionContainer: {
        borderRadius: scale(20),
        padding: scale(5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(15),
        paddingHorizontal: scale(15),
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        marginRight: scale(15),
    },
    destructiveIcon: {
        backgroundColor: '#FFEBEE',
    },
    itemText: {
        fontSize: moderateScale(15),
        fontWeight: '500',
    },
    destructiveText: {
        color: '#FF5252',
    },
    separator: {
        height: 1,
        marginLeft: scale(60),
    },
    arrow: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
    },
    versionContainer: {
        position: 'absolute',
        right: scale(15),
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    versionText: {
        fontSize: moderateScale(14),
    },
});

export default SettingScreen;
