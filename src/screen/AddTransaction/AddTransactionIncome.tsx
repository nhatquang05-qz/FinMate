import React, { useState } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import TransactionTypeToggle from '../../components/TransactionTypeToggle/TransactionTypeToggle';

type TransactionType = 'expense' | 'income';

const backgroundImage = require('../../assets/images/background.png');

const AddTransactionIncome = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>('income');

  const handleTypeChange = (type: TransactionType) => {
    setTransactionType(type);
  };

  return (
    <ImageBackground 
                source={require('../../assets/images/background.png')} 
                style={styles.backgroundImage}
    >
        <View style={styles.container}>
          <TransactionTypeToggle onSelectionChange={handleTypeChange} />
        </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',     
  },
   backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
});

export default AddTransactionIncome;