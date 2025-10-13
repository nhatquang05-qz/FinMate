import React from 'react'; 
import { View, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { scale } from '../../utils/scaling';

const moneyIcon = require('./money.png');
const calendarIcon = require('./calendar.png');
const homeIcon = require('./Home.png');
const chartIcon = require('./chart.png');
const userIcon = require('./user.png');
const circleBackground = require('./circle.png');

type NavbarProps = {
  activeTab: string;
  onTabPress: (tabName: string) => void;
};

const Navbar = ({ activeTab, onTabPress }: NavbarProps) => {

  return (
    <View style={styles.containerWrapper}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.centerButtonContainer} 
          onPress={() => onTabPress('Home')}
        >
          <ImageBackground
            source={circleBackground}
            style={[
              styles.centerButtonBackground,
              activeTab === 'Home' && styles.activeHomeBorder 
            ]}
            imageStyle={styles.circleImageStyle}
          >
            <Image source={homeIcon} style={styles.homeIcon} />
          </ImageBackground>
        </TouchableOpacity>              
        <TouchableOpacity style={styles.tabButton} onPress={() => onTabPress('Money')}>
          <Image source={moneyIcon} style={styles.tabIcon} />
          {activeTab === 'Money' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => onTabPress('Calendar')}>
          <Image source={calendarIcon} style={styles.tabIcon} />
          {activeTab === 'Calendar' && <View style={styles.underline} />}
        </TouchableOpacity>
        <View style={styles.centerPlaceholder} />
        <TouchableOpacity style={styles.tabButton} onPress={() => onTabPress('Chart')}>
          <Image source={chartIcon} style={styles.tabIcon} />
          {activeTab === 'Chart' && <View style={styles.underline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => onTabPress('User')}>
          <Image source={userIcon} style={styles.tabIcon} />
          {activeTab === 'User' && <View style={styles.underline} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: scale(20)    
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    width: '90%',
    height: scale(65),
    borderRadius: scale(40),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabIcon: {
    width: scale(30),
    height: scale(36),
    resizeMode: 'contain',
  },
  centerPlaceholder: {
    flex: 1,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: scale(-20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, 
    left: '50%',
    marginLeft: -(scale(75) / 2),
    alignSelf: 'center',
  },
  centerButtonBackground: {
    width: scale(75),
    height: scale(75),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(5),
    borderColor: '#c1c2c2ff',
    borderRadius: scale(40),
    alignSelf: 'center',
  },
  homeIcon: {
    width: scale(40),
    height: scale(40),
    resizeMode: 'contain',
  },
  activeHomeBorder: {
    borderWidth: scale(5),
    borderColor: '#04D1C1',
    borderRadius: scale(40),
  },
  circleImageStyle: {
    borderRadius: scale(38),
  },
  underline: {
    position: 'absolute',
    bottom: scale(10),
    width: scale(30),
    height: scale(4),
    backgroundColor: '#04D1C1',
    borderRadius: scale(2),
  },
});

export default Navbar;