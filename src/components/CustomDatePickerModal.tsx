import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import WheelPicker from './WheelPicker';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const createRange = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => String(start + i));

type DatePickerMode = 'day' | 'month' | 'year';

type CustomDatePickerModalProps = {
    visible: boolean;
    initialDate?: Date;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    maximumDate?: Date;
    minimumDate?: Date;
    mode?: DatePickerMode;
    useNativeModal?: boolean;
};

const CustomDatePickerModal = ({
    visible,
    initialDate = new Date(),
    onClose,
    onConfirm,
    maximumDate,
    minimumDate,
    mode = 'day',
    useNativeModal = true,
}: CustomDatePickerModalProps) => {
    const [date, setDate] = useState(initialDate);

    useEffect(() => {
        if (visible) {
            setDate(initialDate);
        }
    }, [visible]);

    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const YEARS = useMemo(() => {
        const startYear = minimumDate ? minimumDate.getFullYear() : new Date().getFullYear() - 100;
        const endYear = maximumDate ? maximumDate.getFullYear() : new Date().getFullYear() + 50;
        return createRange(startYear, endYear);
    }, [maximumDate, minimumDate]);

    const MONTHS = useMemo(() => {
        let start = 1;
        let end = 12;
        if (minimumDate && year === minimumDate.getFullYear()) start = minimumDate.getMonth() + 1;
        if (maximumDate && year === maximumDate.getFullYear()) end = maximumDate.getMonth() + 1;
        return createRange(start, end);
    }, [year, maximumDate, minimumDate]);

    const days = useMemo(() => {
        let end = getDaysInMonth(year, month);
        if (maximumDate && year === maximumDate.getFullYear() && month === maximumDate.getMonth()) {
            end = maximumDate.getDate();
        }
        return createRange(1, end);
    }, [year, month, maximumDate]);

    const updateDate = (newDatePart: { day?: number; month?: number; year?: number }) => {
        const newYear = newDatePart.year || year;
        const newMonth = newDatePart.month ? newDatePart.month - 1 : month;
        const newDay = newDatePart.day || day;

        let finalDate = new Date(newYear, newMonth, newDay);

        if (maximumDate && finalDate > maximumDate) finalDate = maximumDate;
        if (minimumDate && finalDate < minimumDate) finalDate = minimumDate;

        const daysInNewMonth = getDaysInMonth(finalDate.getFullYear(), finalDate.getMonth());
        if (finalDate.getDate() > daysInNewMonth) {
            finalDate.setDate(daysInNewMonth);
        }

        setDate(finalDate);
    };

    const handleConfirm = () => {
        onConfirm(date);
    };

    const headerTitle = useMemo(() => {
        if (mode === 'year') return 'Chọn Năm';
        if (mode === 'month') return 'Chọn Tháng';
        return 'Chọn Ngày';
    }, [mode]);

    const PickerContent = (
        <SafeAreaView
            style={[styles.modalContainer, !useNativeModal && styles.nestedContainer]}
            onTouchEnd={useNativeModal ? onClose : undefined}>
            <View style={styles.pickerContainer} onTouchEnd={e => e.stopPropagation()}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                </View>
                <View style={styles.headerSeparator} />

                <View style={styles.wheelsContainer}>
                    {mode === 'day' && (
                        <>
                            <WheelPicker
                                data={days}
                                selectedValue={String(day)}
                                onValueChange={newDay => updateDate({ day: Number(newDay) })}
                            />
                            <View style={styles.columnSeparator} />
                        </>
                    )}

                    {(mode === 'day' || mode === 'month') && (
                        <>
                            <WheelPicker
                                data={MONTHS}
                                selectedValue={String(month + 1)}
                                onValueChange={newMonth => updateDate({ month: Number(newMonth) })}
                            />
                            <View style={styles.columnSeparator} />
                        </>
                    )}

                    <WheelPicker
                        data={YEARS}
                        selectedValue={String(year)}
                        onValueChange={newYear => updateDate({ year: Number(newYear) })}
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Huỷ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handleConfirm}>
                        <Text style={[styles.buttonText, styles.confirmButtonText]}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );

    if (useNativeModal) {
        return (
            <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
                {PickerContent}
            </Modal>
        );
    }

    if (!visible) return null;
    return <View style={styles.overlayWrapper}>{PickerContent}</View>;
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    nestedContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    overlayWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 10,
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    header: { alignItems: 'center', paddingBottom: 20 },
    headerTitle: { fontFamily: 'Coiny-Regular', fontSize: 26, color: '#333' },
    headerSeparator: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: -20 },
    wheelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
    },
    columnSeparator: { width: 1, height: '80%', backgroundColor: '#F0F0F0' },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
        backgroundColor: '#F5F5F5',
    },
    buttonText: { fontFamily: 'Coiny-Regular', fontSize: 18, color: '#555' },
    confirmButton: {
        backgroundColor: '#04D1C1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    confirmButtonText: { color: 'white' },
});

export default CustomDatePickerModal;
