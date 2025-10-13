import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { scale, moderateScale, verticalScale } from '../../utils/scaling';

type TransactionType = 'expense' | 'income';

interface TransactionTypeToggleProps {
  onSelectionChange: (type: TransactionType) => void;
}

const TransactionTypeToggle: React.FC<TransactionTypeToggleProps> = ({ onSelectionChange }) => {
  const [selectedType, setSelectedType] = useState<TransactionType>('income');

  const handleSelect = (type: TransactionType) => {
    setSelectedType(type);
    onSelectionChange(type);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button, 
            selectedType === 'income' ? styles.selectedButton : styles.unselectedButton
          ]}
          onPress={() => handleSelect('income')}
          activeOpacity={0.8}
        >
          <Text 
            style={[
              styles.buttonText, 
              selectedType === 'income' ? styles.selectedButtonText : styles.unselectedButtonText
            ]}
          >
            Thu
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            selectedType === 'expense' ? styles.selectedButton : styles.unselectedButton
          ]}
          onPress={() => handleSelect('expense')}
          activeOpacity={0.8}
        >
          <Text 
            style={[
              styles.buttonText, 
              selectedType === 'expense' ? styles.selectedButtonText : styles.unselectedButtonText
            ]}
          >
            Chi
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: verticalScale(15),
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(30),
    padding: scale(4),
    width: scale(200),
    height: verticalScale(50),
    alignItems: 'center',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  button: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(25),
  },
  selectedButton: {
    backgroundColor: '#04D1C1',
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: moderateScale(20),     
    fontFamily: 'Coiny-Regular',      
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  unselectedButtonText: {
    color: '#04D1C1',
  },
});

export default TransactionTypeToggle;