import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { scale } from '../utils/scaling';

const Calendar = () => {
    const [date, setDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (offset: number) => {
        const newDate = new Date(date);
        newDate.setMonth(date.getMonth() + offset);
        setDate(newDate);
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const isSelected = selectedDate.toDateString() === currentDate.toDateString();
            const isToday = new Date().toDateString() === currentDate.toDateString();

            days.push(
                <TouchableOpacity
                    key={i}
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(currentDate)}
                >
                    <View style={[
                        styles.dayContainer,
                        isToday && !isSelected && styles.todayContainer,
                        isSelected && styles.selectedDayContainer,
                    ]}>
                        <Text style={[
                            styles.dayText,
                            isSelected && styles.selectedDayText
                        ]}>
                            {i}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
        return days;
    };

    return (
        <View style={styles.shadowBox}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>
                    {`${monthNames[month]} ${year}`}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.daysOfWeekContainer}>
                {daysOfWeek.map(day => (
                    <Text key={day} style={styles.dayOfWeekText}>
                        {day}
                    </Text>
                ))}
            </View>
            <View style={styles.daysContainer}>
                {renderDays()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowBox: {
        width: '95%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFF',
        borderRadius: scale(20),
        padding: scale(15),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignSelf: 'center',
        marginTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: scale(15),
    },
    arrow: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(24),
        color: '#333',
        paddingHorizontal: scale(10),
    },
    monthText: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(24),
        color: '#04D1C1',
    },
    daysOfWeekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: scale(10),
    },
    dayOfWeekText: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(16),
        color: '#A9A9A9',
        width: `${100 / 7}%`,
        textAlign: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(2),
    },
    dayContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: scale(100),
    },
    todayContainer: {
        backgroundColor: '#04d1c11a',
    },
    selectedDayContainer: {
        backgroundColor: '#04D1C1',
        borderRadius: scale(25),

    },
    dayText: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(17),
        color: '#333',
    },
    selectedDayText: {
        color: 'white',
    },
});

export default Calendar;