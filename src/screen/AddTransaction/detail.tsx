import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { verticalScale, moderateScale, scale } from '../../utils/scaling';

const Detail = () => {
  return (
    <View style={styles.boxContainer}>
      <TouchableOpacity style={styles.row}>
        <Text style={styles.label}>Ngày</Text>
        <Text style={styles.valueText}>Hôm nay, 14/10</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    marginTop: verticalScale(10),
    paddingHorizontal: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  label: {
    fontFamily: 'Coiny-Regular',
    fontSize: moderateScale(17),
    color: '#0F172A',
    lineHeight: scale(25),
  },
  valueText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: moderateScale(16),
    color: '#64748B',
    textAlign: 'right',
    flex: 1,
  },
  input: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: moderateScale(16),
    color: '#0F172A',
    flex: 1,
    marginLeft: scale(10),
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
})
export default Detail;