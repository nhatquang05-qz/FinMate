import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AddTransactionExpense from './AddTransactionExpense';
import AddTransactionIncome from './AddTransactionIncome';
import TransactionTypeToggle from '../../components/TransactionTypeToggle/TransactionTypeToggle'; // <-- Import component

type TransactionType = 'expense' | 'income';

const AddTransactionScreen = () => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TransactionTypeToggle onSelectionChange={setActiveTab} />

        <View style={styles.content}>
          {activeTab === 'expense' ? <AddTransactionExpense /> : <AddTransactionIncome />}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#04D1C1',
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    paddingVertical: 15,
    fontFamily: 'BeVietnamPro-Bold',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  content: {
    flex: 1,
    backgroundColor: '#04D1C1',
  },
  saveButton: {
    backgroundColor: '#003B46',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#04D1C1',
    fontSize: 18,
    fontFamily: 'BeVietnamPro-Bold',
  }
});

export default AddTransactionScreen;