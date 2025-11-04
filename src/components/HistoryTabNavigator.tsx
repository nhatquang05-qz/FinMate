import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { scale } from '../utils/scaling';

type HistoryTab = 'all' | 'income' | 'expense';
interface Props {
  activeTab: HistoryTab;
  onTabPress: (tab: HistoryTab) => void;
}

const TABS: { key: HistoryTab, title: string }[] = [
    { key: 'all', title: 'Tất cả' },
    { key: 'income', title: 'Phiếu Thu' },
    { key: 'expense', title: 'Phiếu Chi' },
];

const HistoryTabNavigator: React.FC<Props> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => onTabPress(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: scale(15),
    paddingVertical: scale(10),
    marginVertical: scale(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    paddingHorizontal: scale(15),
    paddingVertical: scale(5),
    borderRadius: scale(10),
  },
  activeTab: {
    backgroundColor: '#E6FFFD',
  },
  tabText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: scale(15),
    color: '#888',
  },
  activeTabText: {
    color: '#04D1C1',
  },
});

export default HistoryTabNavigator;