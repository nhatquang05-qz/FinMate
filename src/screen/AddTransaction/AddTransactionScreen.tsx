import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import AddTransactionExpense from './AddTransactionExpense';
import AddTransactionIncome from './AddTransactionIncome';
import TransactionTypeToggle from '../../components/TransactionTypeToggle/TransactionTypeToggle';

type TransactionType = 'expense' | 'income';

const AddTransactionScreen = () => {
    const [activeTab, setActiveTab] = useState<TransactionType>('expense');

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TransactionTypeToggle activeType={activeTab} onSelectionChange={setActiveTab} />

                <View style={styles.content}>
                    {activeTab === 'expense' ? (
                        <AddTransactionExpense key="expense" />
                    ) : (
                        <AddTransactionIncome key="income" />
                    )}
                </View>
            </View>
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
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default AddTransactionScreen;
