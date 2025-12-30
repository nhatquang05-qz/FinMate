import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import CustomDatePickerModal from '../../components/CustomDatePickerModal';
import { useTheme } from '../../context/ThemeContext';

type DetailProps = {
    date: Date;
    onDateChange: (date: Date) => void;
    amount: string;
    onAmountChange: (amount: string) => void;
    note: string;
    onNoteChange: (note: string) => void;
};

const Detail = ({
    date,
    onDateChange,
    amount,
    onAmountChange,
    note,
    onNoteChange,
}: DetailProps) => {
    const { colors, isDarkMode } = useTheme();
    const [isPickerVisible, setPickerVisible] = useState(false);

    const handleConfirmDate = (newDate: Date) => {
        onDateChange(newDate);
    };

    return (
        <View
            style={[
                styles.boxContainer,
                { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#000' },
            ]}>
            {}
            <TouchableOpacity style={styles.row} onPress={() => setPickerVisible(true)}>
                <Text style={[styles.label, { color: colors.text }]}>Ngày</Text>
                <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                    {date.toLocaleDateString('vi-VN')}
                </Text>
            </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {}
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>Số tiền</Text>
                <TextInput
                    style={[styles.valueText, { color: colors.text }]}
                    placeholder="đ 0"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={onAmountChange}
                />
            </View>

            <View style={[styles.separator, { backgroundColor: colors.border }]} />

            {}
            <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>Ghi chú</Text>
                <TextInput
                    style={[styles.valueText, { color: colors.text }]}
                    placeholder="Thêm ghi chú"
                    placeholderTextColor={colors.textSecondary}
                    value={note}
                    onChangeText={onNoteChange}
                />
            </View>

            <CustomDatePickerModal
                visible={isPickerVisible}
                initialDate={date}
                onClose={() => setPickerVisible(false)}
                onConfirm={handleConfirmDate}
                maximumDate={new Date()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    boxContainer: {
        borderRadius: scale(20),
        padding: scale(15),
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(5),
    },
    label: {
        fontSize: moderateScale(17),
        fontFamily: 'Coiny-Regular',
        lineHeight: scale(30),
    },
    valueText: {
        fontSize: moderateScale(16),
        textAlign: 'right',
        flex: 1,
        marginLeft: scale(10),
        fontFamily: 'BeVietnamPro-Regular',
    },
    separator: {
        height: 1,
        marginVertical: verticalScale(5),
    },
});

export default Detail;
