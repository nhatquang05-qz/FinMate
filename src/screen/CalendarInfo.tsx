import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Calendar from '../components/Calendar';
import { scale } from '../utils/scaling';

const CalendarInfoScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Calendar />
                {/* // */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent', 
    },
    content: {
        flex: 1,
        padding: scale(20),
    },
});

export default CalendarInfoScreen;