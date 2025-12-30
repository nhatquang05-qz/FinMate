import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { scale, verticalScale, moderateScale } from '../utils/scaling';
import { useTheme } from '../context/ThemeContext';

interface Category {
    id: number;
    name: string;
    icon: ImageSourcePropType;
}

interface CategoryPickerProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelectCategory: (category: Category) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
}) => {
    const { colors, isDarkMode } = useTheme();

    return (
        <View>
            <View
                style={[
                    styles.shadowBox,
                    { backgroundColor: colors.card, shadowColor: isDarkMode ? '#000' : '#000' },
                ]}>
                <View style={styles.categoryGrid}>
                    {categories.map(cat => {
                        const isSelected = selectedCategory?.id === cat.id;

                        const itemBackgroundColor = isSelected
                            ? colors.primary
                            : isDarkMode
                              ? '#2C2C2C'
                              : '#b4e2deff';

                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    {
                                        backgroundColor: itemBackgroundColor,
                                        borderColor: isSelected ? colors.primary : 'transparent',
                                    },
                                ]}
                                onPress={() => onSelectCategory(cat)}>
                                <Image
                                    source={cat.icon}
                                    style={[
                                        styles.categoryIcon,
                                        isSelected && styles.selectedCategoryIcon,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.categoryName,
                                        { color: isSelected ? '#FFFFFF' : colors.text },
                                    ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowBox: {
        borderRadius: scale(20),
        padding: scale(15),

        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    titleText: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(18),
        textAlign: 'center',
    },
    categoryGrid: {
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(15),
        borderWidth: 1,
        borderColor: 'transparent',
    },

    selectedCategoryItem: {},
    categoryIcon: {
        width: scale(32),
        height: scale(32),
        resizeMode: 'contain',
        marginBottom: verticalScale(8),
    },
    selectedCategoryIcon: {},
    categoryName: {
        fontFamily: 'Coiny-Regular',
        fontSize: moderateScale(14),
    },
    selectedCategoryName: {
        color: '#FFFFFF',
    },
});

export default CategoryPicker;
