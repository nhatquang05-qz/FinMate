import React from 'react';
import {
    SafeAreaView,
    ImageBackground,
    StyleSheet,
    Text,
} from "react-native";
import { scale } from '../../utils/scaling';

const backgroundImage = require('../../assets/images/background.png')

const HomeScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={backgroundImage}
                resizeMode='cover'
                style={styles.backgroundImage}
            >
                <Text style={styles.welcomeText}>Chào mừng bạn!</Text>
            </ImageBackground>
        </SafeAreaView>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    welcomeText: {
        fontSize: scale(30),
        color: "#04D1C1",
        fontFamily: 'Coiny-Regular',
    }
});