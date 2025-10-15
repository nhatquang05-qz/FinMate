import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import CustomDatePickerModal from '../../components/CustomDatePickerModal';

const Detail = () => {
  const [date, setDate] = useState(new Date());
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleConfirmDate = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <View style={styles.boxContainer}>
      <TouchableOpacity style={styles.row} onPress={() => setPickerVisible(true)}>
        <Text style={styles.label}>Ngày</Text>
        <Text style={styles.valueText}>{date.toLocaleDateString('vi-VN')}</Text>
      </TouchableOpacity>

      <View style={styles.separator} />
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>Số tiền</Text>
        <TextInput
          style={styles.valueText}
          placeholder="đ 0"
          placeholderTextColor="#c0c0c0"
          keyboardType="numeric"
        />
      </TouchableOpacity>

      <View style={styles.separator} />
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={styles.valueText}
          placeholder="Thêm ghi chú"
          placeholderTextColor="#c0c0c0"
        />
      </TouchableOpacity>

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
    backgroundColor: 'white',
    borderRadius: scale(20),
    padding: scale(15),
    shadowColor: '#000',
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
      color: '#182033ff',
      fontFamily: 'Coiny-Regular',
      lineHeight: scale(30),
    },
    valueText: {
      fontSize: moderateScale(16),
      color: '#64748B',
      textAlign: 'right',
      flex: 1,
      marginLeft: scale(10),
    },
    separator: {
      height: 1,
      backgroundColor: '#F1F5F9',
    },
  });

export default Detail;