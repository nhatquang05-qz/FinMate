import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { scale } from '../../utils/scaling';

const screenTitles: { [key: string]: string } = {
  Home: 'Trang chủ',
  Money: 'Nhập',
  Calendar: 'Lịch',
  Chart: 'Biểu đồ',
  User: 'Tài khoản',
};

interface HeaderProps {
  activeTab: string;
}

const Header = ({ activeTab }: HeaderProps) => {
  const title = screenTitles[activeTab] || 'Trang chủ';

  return (
    <View style={styles.headerContainer}>
      <View style={styles.placeholder} />
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.rightIconContainer}>
        <View style={styles.iconWrapper}>
          <Image 
            source={require('./notification-icon.png')} 
            style={styles.icon} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: scale(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: scale(10),
  },
  placeholder: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Coiny-Regular',
    lineHeight: scale(45),
    textAlign: 'center',
    fontSize: scale(35),
    color: "#04D1C1",
  },
  rightIconContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    padding: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.1,
    shadowRadius: scale(5),
    elevation: scale(5),
  },
  icon: {
    width: scale(24),
    height: scale(24),
  }
});

export default Header;