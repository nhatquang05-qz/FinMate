import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { scale } from '../../utils/scaling';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const moneyIcon = require('./money.png');
const calendarIcon = require('./calendar.png');
const homeIcon = require('./Home.png');
const chartIcon = require('./chart.png');
const userIcon = require('./user.png');

type NavbarProps = {
    activeTab: string;
    onTabPress: (tabName: string) => void;
};

const Navbar = ({ activeTab, onTabPress }: NavbarProps) => {
    const insets = useSafeAreaInsets();
    const { isDarkMode, colors } = useTheme();

    return (
        <View style={[styles.containerWrapper, { bottom: insets.bottom + scale(20) }]}>
            <View
                style={[
                    styles.container,

                    { backgroundColor: isDarkMode ? colors.card : '#ffffffff' },
                ]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                        styles.centerButtonContainer,

                        {
                            backgroundColor: isDarkMode ? colors.card : '#ffffff',
                            borderColor: isDarkMode ? '#333' : '#E0E0E0',
                        },
                        activeTab === 'Home' && styles.activeHomeBorder,
                    ]}
                    onPress={() => onTabPress('Home')}>
                    <Image source={homeIcon} style={styles.homeIcon} />
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
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',

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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        left: '50%',
        alignSelf: 'center',

        width: scale(70),
        height: scale(70),
        borderRadius: scale(35),
        top: scale(-15),
        marginLeft: -(scale(70) / 2),

        borderWidth: scale(5),
    },
    homeIcon: {
        width: scale(40),
        height: scale(40),
        resizeMode: 'contain',
    },
    activeHomeBorder: {
        borderColor: '#04D1C1',
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
