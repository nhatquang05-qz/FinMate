import React from 'react';
import {
    SafeAreaView,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { scale } from '../../utils/scaling';

const backgroundImage = require('../../assets/images/background.png');

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={backgroundImage}
                resizeMode='cover'
                style={StyleSheet.absoluteFillObject} 
            />
            <View style={styles.mainContent}>
                <Text style={styles.welcomeText}>Chào mừng bạn!</Text>
            </View>
        </View>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: scale(30),
        color: "#04D1C1",
        fontFamily: 'Coiny-Regular',
    }
});