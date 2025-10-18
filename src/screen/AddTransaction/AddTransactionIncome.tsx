import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import CategoryPicker from '../../components/CategoryPicker';
import Detail from './detail';
import PopupSuccess from '../../components/popups/PopupSuccess'; 
import PopupFailed from '../../components/popups/PopupFailed';  

const investIcon = require('./earning.png');
const bonusIcon = require('./pay-day.png');
const partimeIcon = require('./part-time.png');
const salaryIcon = require('./salary.png');
const subsidyIcon = require('./subsidize.png');
const tempIcon = require('../Home/bike.png');

const IncomeCategories = [
  { id: '1', name: 'Lương', icon: salaryIcon },
  { id: '2', name: 'Phụ cấp', icon: subsidyIcon },
  { id: '3', name: 'Việc phụ', icon: partimeIcon },
  { id: '4', name: 'Tiền thưởng', icon: bonusIcon },
  { id: '5', name: 'Đầu tư', icon: investIcon },
  { id: '6', name: 'Thêm', icon: tempIcon },
];

const AddTransactionIncome = () => {
  const [selectedCategory, setSelectedCategory] = useState(IncomeCategories[0]);
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const [isFailedVisible, setFailedVisible] = useState(false);

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    setAmount('');
    setNote('');
    setSelectedCategory(IncomeCategories[0]);
    setDate(new Date());
  };

  const handleSave = () => {
    const numericAmount = parseFloat(amount.trim());
    if (numericAmount > 0 && selectedCategory) {
      setSuccessVisible(true);
    } else {
      setFailedVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: verticalScale(200) }}
        showsVerticalScrollIndicator={false}
      >
        <Detail
          date={date}
          onDateChange={setDate}
          amount={amount}
          onAmountChange={setAmount}
          note={note}
          onNoteChange={setNote}
        />
        <View style={styles.shadowbox}>
          <Text style={styles.categoryTitle}>Chọn danh mục</Text>
        </View>
        <CategoryPicker
          categories={IncomeCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </ScrollView>
      <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Nhập</Text>
          </TouchableOpacity>
      </View>

      {/* Render các component pop-up */}
      <PopupSuccess visible={isSuccessVisible} onClose={handleSuccessClose} />
      <PopupFailed visible={isFailedVisible} onClose={() => setFailedVisible(false)} />
    </SafeAreaView>
  );
};

// ... styles không đổi

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
});

export default AddTransactionIncome;