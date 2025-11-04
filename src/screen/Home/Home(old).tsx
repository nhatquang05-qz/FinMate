import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ImageBackground 
} from "react-native";
import { scale } from '../../utils/scaling';

type HomeScreenProps = {
  navigateTo: (screenName: string) => void;
};

const HomeScreen = ({ navigateTo }: HomeScreenProps) => { 
    return (
        <ImageBackground 
            source={require('../../assets/images/background.png')} 
            style={styles.backgroundImage}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Quản lý</Text>
                        <View style={styles.card}>
                            <View style={styles.managementIconsContainer}>
                                <TouchableOpacity onPress={() => navigateTo('Money')}>
                                    <Image source={require('./AddTrans.png')} style={styles.managementIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigateTo('History')}>
                                    <Image source={require('./History.png')} style={styles.managementIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigateTo('Statistic')}>
                                    <Image source={require('./Statistic.png')} style={styles.managementIcon} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => navigateTo('Setting')}>
                                    <Image source={require('./Setting.png')} style={styles.managementIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Thống kê</Text>
                        <ScrollView 
                            horizontal={true} 
                            showsHorizontalScrollIndicator={false}
                        >
                            <View style={styles.statisticCard}>
                                <Image source={require('./food.png')} style={styles.statisticIcon} />
                                <View style={styles.statisticTextContainer}>
                                    <Text style={styles.statisticCategory}>Ăn uống</Text>
                                    <Text style={styles.statisticAmount}>3.500.000 vnd</Text>
                                </View>
                            </View>
                            <View style={styles.statisticCard}>
                                <Image source={require('./bike.png')} style={styles.statisticIcon} />
                                <View style={styles.statisticTextContainer}>
                                    <Text style={styles.statisticCategory}>Đi lại</Text>
                                    <Text style={styles.statisticAmount}>600.000 vnd</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Biểu đồ chi tiêu</Text>
                        <View style={[styles.card, styles.chartCard]}>
                            {/* Thêm chart vào sau */}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: scale(20),
        paddingVertical: scale(10),
    },
    sectionContainer: {
        marginBottom: scale(20),
    },
    sectionTitle: {
        fontSize: scale(20),
        fontFamily: 'Coiny-Regular',
        color: '#04D1C1',
        marginBottom: scale(10),
        marginLeft: scale(5),
        lineHeight: scale(25),
    },
    card: {
        backgroundColor: 'white',
        borderRadius: scale(20),
        padding: scale(15),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    managementIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    managementIcon: {
        width: scale(55),
        height: scale(55),
        resizeMode: 'contain',
    },
    statisticCard: {
        backgroundColor: '#E6FFFD',
        borderRadius: scale(15),
        padding: scale(15),
        marginRight: scale(15),
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: scale(180),
    },
    statisticIcon: {
        width: scale(40),
        height: scale(40),
        resizeMode: 'contain',
        marginRight: scale(10),
    },
    statisticTextContainer: {
        flexDirection: 'column',
    },
    statisticCategory: {
        fontSize: scale(14),
        fontFamily: 'Coiny-Regular',
        color: '#333',
        lineHeight: scale(20),
    },
    statisticAmount: {
        fontSize: scale(16),
        fontFamily: 'Coiny-Regular',
        color: '#04D1C1',
    },
    chartCard: {
        height: scale(200),
        justifyContent: 'center',
        alignItems: 'center',
    },
});