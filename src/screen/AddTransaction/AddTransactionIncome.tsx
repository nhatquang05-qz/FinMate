import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
const tempIcon = require('../Home/bike.png');

const incomeCategories = [
  { id: '1', name: 'Lương', icon: tempIcon },
  { id: '2', name: 'Phụ cấp', icon: tempIcon },
  { id: '3', name: 'Thưởng', icon: tempIcon },
  { id: '4', name: 'Đầu tư', icon: tempIcon },
  { id: '5', name: 'Bán đồ', icon: tempIcon },
  { id: '6', name: 'Khác', icon: tempIcon },
];

const AddTransactionIncome = () => {
  const [selectedCategory, setSelectedCategory] = useState(incomeCategories[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: verticalScale(100) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.boxContainer}>
          <TouchableOpacity style={styles.row}>
            <Text style={styles.label}>Ngày</Text>
            <Text style={styles.valueText}>Hôm nay, 14/10/2025</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.label}>Số tiền</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={styles.input}
              placeholder="Viết ghi chú..."
              placeholderTextColor="#94A3B8"
              textAlign="right"
            />
          </View>
        </View>

        <View style={styles.categorySection}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitleText}>Danh mục</Text>
          </View>
          <View style={styles.categoryGrid}>
            {incomeCategories.map((category) => {
              const isSelected = selectedCategory.id === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.selectedCategoryItem,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Image
                    source={category.icon}
                    style={[
                      styles.categoryIcon,
                      isSelected && styles.selectedCategoryIcon,
                    ]}
                  />
                  <Text style={[
                    styles.categoryName,
                    isSelected && styles.selectedCategoryName,
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Nhập</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFF',
  },
  container: {
    flex: 1,
  },
  boxContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    marginHorizontal: scale(15),
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
    paddingVertical: verticalScale(18),
  },
  label: {
    fontFamily: 'Coiny-Regular',
    fontSize: moderateScale(16),
    color: '#0F172A',
  },
  valueText: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: moderateScale(16),
    color: '#64748B',
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
  categorySection: {
    marginTop: verticalScale(25),
    paddingHorizontal: scale(15),
  },

  categoryTitleContainer: {
    width: '35%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitleText: {
    fontFamily: 'Coiny-Regular',
    fontSize: moderateScale(18),
    color: '#000000ff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#83dad2ff',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(15),
  },
  selectedCategoryItem: {
    backgroundColor: '#27b8acff',
    borderColor: '#179ad6ff',
  },
  categoryIcon: {
    width: scale(32),
    height: scale(32),
    resizeMode: 'contain',
    marginBottom: verticalScale(8),
  },
  selectedCategoryIcon: {
    tintColor: '#FFFFFF',
  },
  categoryName: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: moderateScale(13),
    color: '#000000ff',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
  saveButtonContainer: {
    bottom: scale(90),
    width: '40%',
    alignSelf: 'center',
    paddingHorizontal: scale(15),
    paddingBottom: verticalScale(20),
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#04D1C1',
    borderRadius: moderateScale(30),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'Coiny-Regular',
    fontSize: moderateScale(20),
    color: '#ffffffff',
  },
});

export default AddTransactionIncome;