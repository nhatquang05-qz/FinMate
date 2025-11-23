import React, { useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import CategoryPicker from '../../components/CategoryPicker';
import Detail from './detail';
import PopupSuccess from '../../components/popups/PopupSuccess'; 
import PopupFailed from '../../components/popups/PopupFailed';  
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { iconMap } from '../../utils/iconMap';
import { Category } from '../../types/data';
import { NotificationManager } from '../../utils/NotificationManager'; 

const AddTransactionIncome = () => {
  const {
    categories,
    selectedCategory,
    date,
    amount,
    note,
    isLoading,
    isSuccessVisible,
    isFailedVisible,
    setSelectedCategory,
    setDate,
    setAmount,
    setNote,
    handleSave,
    handleSuccessClose,
    setFailedVisible,
  } = useTransactionForm('income');

  useEffect(() => {
    if (isSuccessVisible) {
      const catName = selectedCategory?.name || 'Khoản thu';
      NotificationManager.addNotification(
        'Nhập thành công',
        `Bạn vừa thêm khoản thu "${catName}" với số tiền ${amount}đ.`,
        'success'
      );
    }
  }, [isSuccessVisible]);

  const formattedCategories = categories.map((cat: Category) => ({
    ...cat,
    icon: iconMap[cat.icon] || iconMap.default,
  }));
  
  const formattedSelectedCategory = formattedCategories.find(c => c.id === selectedCategory?.id) || null;

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
          categories={formattedCategories}
          selectedCategory={formattedSelectedCategory}
          onSelectCategory={(category) => {
            const originalCategory = categories.find(c => c.id === category.id);
            if (originalCategory) {
              setSelectedCategory(originalCategory);
            }
          }}
        />
      </ScrollView>
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Nhập</Text>
          )}
        </TouchableOpacity>
      </View>

      <PopupSuccess visible={isSuccessVisible} onClose={handleSuccessClose} />
      <PopupFailed visible={isFailedVisible} onClose={() => setFailedVisible(false)} />
    </SafeAreaView>
  );
};

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