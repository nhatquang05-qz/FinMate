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

const SettingScreen = () => {
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
            await exportToExcel();
            setIsExporting(false);
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

    const SettingItem = ({
        title,
        icon,
        isSwitch,
        value,
        onToggle,
        isDestructive,
        hideArrow,
        isLoading,
    }: any) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={isSwitch ? onToggle : onToggle}
            disabled={isSwitch || isLoading}
            activeOpacity={0.7}>
            <View style={styles.leftContent}>
                <View style={[styles.iconPlaceholder, isDestructive && styles.destructiveIcon]}>
                    {/* Placeholder icon */}
                </View>
                <Text style={[styles.itemText, isDestructive && styles.destructiveText]}>
                    {title}
                </Text>
            </View>

            {isSwitch ? (
                <Switch
                    trackColor={{ false: '#767577', true: '#04D1C1' }}
                    thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={onToggle}
                    value={value}
                />
            ) : isLoading ? (
                <ActivityIndicator size="small" color="#04D1C1" />
            ) : (
                !hideArrow && <Text style={styles.arrow}>{'>'}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Chung</Text>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        title="Nhắc nhở nhập liệu hàng ngày"
                        isSwitch={true}
                        value={isNotificationEnabled}
                        onToggle={toggleNotification}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        title="Bảo mật vân tay / FaceID"
                        isSwitch={true}
                        value={isBiometricsEnabled}
                        onToggle={toggleBiometrics}
                    />
                </View>

                <Text style={styles.sectionTitle}>Dữ liệu</Text>
                <View style={styles.sectionContainer}>
                    <SettingItem
                        title="Xuất dữ liệu (Excel)"
                        onToggle={handleExportData}
                        isLoading={isExporting}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        title="Xóa bộ nhớ đệm"
                        onToggle={handleClearData}
                        isDestructive={true}
                        hideArrow={true}
                    />
                </View>

                {/* Section: Thông tin */}
                <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
                <View style={styles.sectionContainer}>
                    <SettingItem title="Phiên bản" onToggle={() => {}} hideArrow={true} />
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        padding: scale(20),
        paddingBottom: verticalScale(100),
    },
    sectionTitle: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(16),
        color: '#999',
        marginBottom: verticalScale(10),
        marginTop: verticalScale(10),
        marginLeft: scale(10),
    },
    sectionContainer: {
        backgroundColor: '#FFF',
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
        backgroundColor: '#E0F7FA',
        marginRight: scale(15),
    },
    destructiveIcon: {
        backgroundColor: '#FFEBEE',
    },
    itemText: {
        fontSize: moderateScale(15),
        color: '#333',
        fontWeight: '500',
    },
    destructiveText: {
        color: '#FF5252',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: scale(60),
    },
    arrow: {
        fontSize: moderateScale(18),
        color: '#CCC',
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
        color: '#999',
        fontSize: moderateScale(14),
    },
});

export default SettingScreen;
