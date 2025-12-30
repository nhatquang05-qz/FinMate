import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale } from '../utils/scaling';
import { useTheme } from '../context/ThemeContext';

type HistoryTab = 'all' | 'income' | 'expense';
interface Props {
    activeTab: HistoryTab;
    onTabPress: (tab: HistoryTab) => void;
}

const TABS: { key: HistoryTab; title: string }[] = [
    { key: 'all', title: 'Tất cả' },
    { key: 'income', title: 'Phiếu Thu' },
    { key: 'expense', title: 'Phiếu Chi' },
];

const HistoryTabNavigator: React.FC<Props> = ({ activeTab, onTabPress }) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#000' },
            ]}>
            {TABS.map(tab => {
                const isActive = activeTab === tab.key;

                const activeBackgroundColor = isDarkMode ? colors.primary + '33' : '#E6FFFD';

                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, isActive && { backgroundColor: activeBackgroundColor }]}
                        onPress={() => onTabPress(tab.key)}>
                        <Text
                            style={[
                                styles.tabText,
                                { color: colors.textSecondary },
                                isActive && { color: colors.primary },
                            ]}>
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',

        borderRadius: scale(15),
        paddingVertical: scale(10),
        marginVertical: scale(15),
        elevation: 3,

        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        paddingHorizontal: scale(15),
        paddingVertical: scale(5),
        borderRadius: scale(10),
    },
    tabText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(15),
    },
});

export default HistoryTabNavigator;
