import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale } from '../utils/scaling';

type CalendarProps = {
    onDateSelect: (date: Date) => void;
};

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
    const localToday = new Date();
    const todayUTC = new Date(
        Date.UTC(localToday.getFullYear(), localToday.getMonth(), localToday.getDate()),
    );

    const [displayDate, setDisplayDate] = useState(todayUTC);
    const [selectedDate, setSelectedDate] = useState(todayUTC);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        onDateSelect(date);
    };

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const monthNames = [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
    ];

    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();
    const monthName = monthNames[month];

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    const startingDayOfWeek = firstDayOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const changeMonth = (delta: number) => {
        setDisplayDate(prevDate => {
            const newMonth = prevDate.getUTCMonth() + delta;
            return new Date(Date.UTC(prevDate.getUTCFullYear(), newMonth, 1));
        });
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(year, month, day));
            const isSelected = selectedDate.getTime() === date.getTime();
            const isToday = todayUTC.getTime() === date.getTime();
            const isFuture = date.getTime() > todayUTC.getTime();

            days.push(
                <TouchableOpacity
                    key={day}
                    style={styles.dayCell}
                    onPress={() => handleSelectDate(date)}
                    disabled={isFuture}>
                    <View
                        style={[
                            styles.dayContainer,
                            isToday && styles.todayContainer,
                            isSelected && !isFuture && styles.selectedDayContainer,
                        ]}>
                        <Text
                            style={[
                                styles.dayText,
                                isSelected && !isFuture && styles.selectedDayText,
                                isFuture && styles.disabledDayText,
                            ]}>
                            {day}
                        </Text>
                    </View>
                </TouchableOpacity>,
            );
        }
        return days;
    };

    return (
        <View style={styles.calendarContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>{`${monthName} ${year}`}</Text>
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
            <View style={styles.daysContainer}>{renderDays()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: scale(20),
        padding: scale(15),
        marginHorizontal: scale(10),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        borderColor: '#04D1C1',
        borderWidth: 2,
    },
    selectedDayContainer: {
        backgroundColor: '#04D1C1',
        borderRadius: scale(100),
    },
    dayText: {
        fontFamily: 'BeVietnamPro-Bold',
        fontSize: scale(16),
        color: '#333',
    },
    selectedDayText: {
        color: 'white',
    },
    disabledDayText: {
        color: '#ccc', // or use opacity: 0.5
    },
});

export default Calendar;
