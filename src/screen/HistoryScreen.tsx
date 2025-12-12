import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../api/apiClient';
import { Transaction, Category } from '../types/data';
import TransactionItem from '../components/TransactionItem';
import HistoryTabNavigator from '../components/HistoryTabNavigator';
import CategoryFilterModal from '../components/CategoryFilterModal';
import { scale } from '../utils/scaling';

type HistoryTab = 'all' | 'income' | 'expense';

type HistoryFilter = { categoryId: number; type: 'income' | 'expense' };
interface HistoryScreenProps {
    initialFilter: HistoryFilter | null;
    onClearFilter: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ initialFilter, onClearFilter }) => {
    const [activeTab, setActiveTab] = useState<HistoryTab>(initialFilter?.type || 'all');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        initialFilter ? [initialFilter.categoryId] : [],
    );

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    // Dọn dẹp bộ lọc ở component cha sau khi đã sử dụng (chỉ chạy 1 lần)
    useEffect(() => {
        if (initialFilter) {
            onClearFilter();
        }
    }, []);

    // Lấy danh sách tất cả danh mục (chỉ chạy 1 lần)
    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const response = await apiClient.get<Category[]>('/categories');
                setAllCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch all categories:', error);
            }
        };
        fetchAllCategories();
    }, []);

    // Tải lại dữ liệu khi tab hoặc filter thay đổi.
    // Lần đầu tiên chạy, nó sẽ dùng state đã được khởi tạo đúng.
    useEffect(() => {
        fetchData();
    }, [activeTab, selectedCategoryIds]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const params: { type?: HistoryTab; category_ids?: string } = {};
            if (activeTab !== 'all') {
                params.type = activeTab;
            }
            if (selectedCategoryIds.length > 0) {
                params.category_ids = selectedCategoryIds.join(',');
            }

            const response = await apiClient.get<Transaction[]>('/transactions', { params });
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // XỬ LÝ VIỆC CHUYỂN TAB
    const handleTabChange = (tab: HistoryTab) => {
        setActiveTab(tab);
        // Reset bộ lọc mỗi khi chuyển tab
        setSelectedCategoryIds([]);
    };

    const handleApplyFilter = (ids: number[]) => {
        setSelectedCategoryIds(ids);
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy giao dịch nào.</Text>
        </View>
    );

    // Lọc danh sách category để hiển thị trong modal dựa trên tab đang chọn
    const categoriesForFilter = allCategories.filter(
        cat => activeTab === 'all' || cat.type === activeTab,
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <HistoryTabNavigator activeTab={activeTab} onTabPress={handleTabChange} />
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}>
                    <Text style={styles.filterText}>
                        {selectedCategoryIds.length > 0
                            ? `Đang lọc (${selectedCategoryIds.length} danh mục)`
                            : 'Lọc theo danh mục'}
                    </Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#04D1C1" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={transactions}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        keyExtractor={item => item.id.toString()}
                        ListEmptyComponent={renderEmptyComponent}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <CategoryFilterModal
                visible={isFilterModalVisible}
                categories={categoriesForFilter}
                initialSelectedIds={selectedCategoryIds}
                onClose={() => setFilterModalVisible(false)}
                onApply={handleApplyFilter}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    content: { flex: 1, paddingHorizontal: scale(20) },
    filterButton: {
        backgroundColor: '#fff',
        padding: scale(10),
        borderRadius: scale(10),
        alignItems: 'center',
        marginBottom: scale(15),
        borderWidth: 1,
        borderColor: '#E6FFFD',
    },
    filterText: {
        fontFamily: 'BeVietnamPro-Bold',
        color: '#04D1C1',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scale(100),
    },
    emptyText: {
        fontFamily: 'BeVietnamPro-Regular',
        fontSize: scale(16),
        color: '#888',
    },
});

export default HistoryScreen;
