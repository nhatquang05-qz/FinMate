import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { scale, verticalScale, moderateScale } from '../../src/utils/scaling';

interface Category {
  id: string;
  name: string;
  icon: ImageSourcePropType;
}

interface CategoryPickerProps {
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View>
        <View style={[styles.shadowBox]}>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                selectedCategory.id === cat.id && styles.selectedCategoryItem,
              ]}
              onPress={() => onSelectCategory(cat)}
            >
              <Image
                source={cat.icon}
                style={[
                  styles.categoryIcon,
                  selectedCategory.id === cat.id && styles.selectedCategoryIcon,
                ]}
              />
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory.id === cat.id && styles.selectedCategoryName,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowBox: {
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
  titleText: {
    fontFamily: 'Coiny-Regular',
    fontSize: moderateScale(17),
    color: '#000000ff',
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
    backgroundColor: '#b4e2deff',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(15),
  },
  selectedCategoryItem: {
    backgroundColor: '#4cc9beff',
    borderColor: '#179ad6ff',
  },
  categoryIcon: {
    width: scale(32),
    height: scale(32),
    resizeMode: 'contain',
    marginBottom: verticalScale(8),
  },
  selectedCategoryIcon: {
  },
  categoryName: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: moderateScale(13),
    color: '#000000ff',
  },
  selectedCategoryName: {
    color: '#FFFFFF',
  },
});

export default CategoryPicker;