import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';

type DatePickerProps = {
  date: Date;
  onDateChange: (newDate: Date) => void;
};

const DatePicker = ({ date, onDateChange }: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setOpen(false); 

    if (event.type === 'set' && selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.row} onPress={() => setOpen(true)}>
        <Text style={styles.label}>Ngày</Text>
        <Text style={styles.valueText}>{date.toLocaleDateString('vi-VN')}</Text>
      </TouchableOpacity>

      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(15),
  },
  label: {
    fontWeight: 'bold',
    fontSize: moderateScale(17),
    color: '#0F172A',
  },
  valueText: {
    fontSize: moderateScale(16),
    color: '#64748B',
    textAlign: 'right',
    flex: 1,
    marginLeft: scale(10),
  },
});

export default DatePicker;