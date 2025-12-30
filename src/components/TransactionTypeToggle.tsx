import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { scale, moderateScale, verticalScale } from '../utils/scaling';
import { useTheme } from '../context/ThemeContext';

type TransactionType = 'expense' | 'income';

interface TransactionTypeToggleProps {
    activeType: TransactionType;
    onSelectionChange: (type: TransactionType) => void;
}

const TransactionTypeToggle: React.FC<TransactionTypeToggleProps> = ({
    activeType,
    onSelectionChange,
}) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <View style={styles.wrapper}>
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#000' },
                ]}>
                {}
                <TouchableOpacity
                    style={[
                        styles.button,
                        activeType === 'income'
                            ? [styles.selectedButton, { backgroundColor: colors.primary }]
                            : styles.unselectedButton,
                    ]}
                    onPress={() => onSelectionChange('income')}
                    activeOpacity={0.8}>
                    <Text
                        style={[
                            styles.buttonText,
                            activeType === 'income'
                                ? styles.selectedButtonText
                                : [styles.unselectedButtonText, { color: colors.primary }],
                        ]}>
                        Thu
                    </Text>
                </TouchableOpacity>

                {}
                <TouchableOpacity
                    style={[
                        styles.button,
                        activeType === 'expense'
                            ? [styles.selectedButton, { backgroundColor: colors.primary }]
                            : styles.unselectedButton,
                    ]}
                    onPress={() => onSelectionChange('expense')}
                    activeOpacity={0.8}>
                    <Text
                        style={[
                            styles.buttonText,
                            activeType === 'expense'
                                ? styles.selectedButtonText
                                : [styles.unselectedButtonText, { color: colors.primary }],
                        ]}>
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

        borderRadius: moderateScale(30),
        padding: scale(4),
        width: scale(200),
        height: verticalScale(50),
        alignItems: 'center',
        justifyContent: 'space-around',
        ...Platform.select({
            ios: {
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
    selectedButton: {},
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
    unselectedButtonText: {},
});

export default TransactionTypeToggle;
