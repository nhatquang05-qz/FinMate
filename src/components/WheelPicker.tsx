import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

type WheelPickerProps = {
    data: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
};

const WheelPicker = ({ data, selectedValue, onValueChange }: WheelPickerProps) => {
    const flatListRef = useRef<FlatList>(null);
    const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

    useEffect(() => {
        const initialIndex = data.indexOf(selectedValue);
        if (initialIndex >= 0 && flatListRef.current) {
            setTimeout(
                () => flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false }),
                0,
            );
        }
    }, [data, selectedValue]);

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (data[index] !== undefined && data[index] !== selectedValue) {
            onValueChange(data[index]);
        }
    };

    const renderItem = ({ item }: { item: string }) => {
        const isSelected = item === selectedValue;
        return (
            <View style={styles.itemContainer}>
                <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>{item}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.highlight} />
            <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingTop: PADDING, paddingBottom: PADDING }}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                initialScrollIndex={data.indexOf(selectedValue)}
                getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: ITEM_HEIGHT * VISIBLE_ITEMS,
    },
    highlight: {
        position: 'absolute',
        top: ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT,
        width: '100%',
        height: ITEM_HEIGHT,
        backgroundColor: '#04d1c11a',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#04d1c14d',
    },
    itemContainer: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontFamily: 'Coiny-Regular',
        fontSize: 22,
        color: '#A9A9A9',
    },
    selectedItemText: {
        color: '#04D1C1',
        fontSize: 26,
    },
});

export default WheelPicker;
