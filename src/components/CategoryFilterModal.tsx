import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { scale } from '../utils/scaling';
import { Category } from '../types/data'; // Import kiểu Category

interface Props {
    visible: boolean;
    categories: Category[];
    initialSelectedIds: number[];
    onClose: () => void;
    onApply: (selectedIds: number[]) => void;
}

const CategoryFilterModal: React.FC<Props> = ({
    visible,
    categories,
    initialSelectedIds,
    onClose,
    onApply,
}) => {
    const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(initialSelectedIds);

    useEffect(() => {
        // Cập nhật state tạm thời khi modal được mở
        setTempSelectedIds(initialSelectedIds);
    }, [visible, initialSelectedIds]);

    const toggleCategory = (id: number) => {
        if (tempSelectedIds.includes(id)) {
            setTempSelectedIds(tempSelectedIds.filter(catId => catId !== id));
        } else {
            setTempSelectedIds([...tempSelectedIds, id]);
        }
    };

    const handleApply = () => {
        onApply(tempSelectedIds);
        onClose();
    };

    const handleClear = () => {
        setTempSelectedIds([]);
    };

    const renderItem = ({ item }: { item: Category }) => {
        const isSelected = tempSelectedIds.includes(item.id);
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => toggleCategory(item.id)}>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Lọc theo danh mục</Text>
                    <FlatList
                        data={categories}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        style={styles.list}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={handleClear}>
                            <Text style={styles.clearButtonText}>Bỏ chọn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.applyButton]}
                            onPress={handleApply}>
                            <Text style={styles.applyButtonText}>Áp dụng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        backgroundColor: 'white',
        height: '60%',
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        padding: scale(20),
    },
    title: {
        fontFamily: 'Coiny-Regular',
        fontSize: scale(22),
        color: '#04D1C1',
        textAlign: 'center',
        marginBottom: scale(20),
    },
    list: { flex: 1 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: scale(15) },
    checkbox: {
        width: scale(24),
        height: scale(24),
        borderWidth: 2,
        borderColor: '#04D1C1',
        borderRadius: scale(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: { backgroundColor: '#04D1C1' },
    checkmark: { color: 'white', fontWeight: 'bold' },
    itemText: { fontFamily: 'BeVietnamPro-Bold', fontSize: scale(16), marginLeft: scale(15) },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: scale(15),
    },
    button: { flex: 1, padding: scale(15), borderRadius: scale(15), alignItems: 'center' },
    clearButton: { backgroundColor: '#F0F0F0', marginRight: scale(10) },
    applyButton: { backgroundColor: '#04D1C1', marginLeft: scale(10) },
    clearButtonText: { fontFamily: 'BeVietnamPro-Bold', color: '#333' },
    applyButtonText: { fontFamily: 'BeVietnamPro-Bold', color: 'white' },
});

export default CategoryFilterModal;
