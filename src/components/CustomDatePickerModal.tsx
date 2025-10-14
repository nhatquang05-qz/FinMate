import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import WheelPicker from './WheelPicker';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const createRange = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => String(start + i));

const YEARS = createRange(new Date().getFullYear() - 100, new Date().getFullYear() + 50);
const MONTHS = createRange(1, 12);

type CustomDatePickerModalProps = {
  visible: boolean;
  initialDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

const CustomDatePickerModal = ({
  visible,
  initialDate = new Date(),
  onClose,
  onConfirm,
}: CustomDatePickerModalProps) => {
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const days = useMemo(() => {
    const numDays = getDaysInMonth(year, month);
    return createRange(1, numDays);
  }, [year, month]);

  const updateDate = (newDatePart: { day?: number; month?: number; year?: number }) => {
    const newDay = newDatePart.day || day;
    const newMonth = newDatePart.month ? newDatePart.month - 1 : month;
    const newYear = newDatePart.year || year;

    const daysInNewMonth = getDaysInMonth(newYear, newMonth);
    const correctedDay = Math.min(newDay, daysInNewMonth);

    setDate(new Date(newYear, newMonth, correctedDay));
  };

  const handleConfirm = () => {
    onConfirm(date);
    onClose();
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} onTouchEnd={onClose}>
        <View style={styles.pickerContainer} onTouchEnd={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chọn ngày</Text>
          </View>
          <View style={styles.headerSeparator} />

          <View style={styles.wheelsContainer}>
            <WheelPicker
              data={days}
              selectedValue={String(day)}
              onValueChange={(newDay) => updateDate({ day: Number(newDay) })}
            />
            <View style={styles.columnSeparator} />
            <WheelPicker
              data={MONTHS}
              selectedValue={String(month + 1)}
              onValueChange={(newMonth) => updateDate({ month: Number(newMonth) })}
            />
            <View style={styles.columnSeparator} />
            <WheelPicker
              data={YEARS}
              selectedValue={String(year)}
              onValueChange={(newYear) => updateDate({ year: Number(newYear) })}
            />
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000080',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Coiny-Regular',
    fontSize: 26,
    color: '#333',
  },
  headerSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: -20, 
  },
  wheelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  columnSeparator: {
    width: 1,
    height: '80%',
    backgroundColor: '#F0F0F0',
  },
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
  buttonText: {
    fontFamily: 'Coiny-Regular',
    fontSize: 18,
    color: '#555',
  },
  confirmButton: {
    backgroundColor: '#04D1C1',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default CustomDatePickerModal;