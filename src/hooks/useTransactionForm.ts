import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../api/apiClient';
import { Category } from '../types/data';

type TransactionType = 'income' | 'expense';

export const useTransactionForm = (type: TransactionType) => {
    // State cho dữ liệu form
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');

    // State cho UI
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccessVisible, setSuccessVisible] = useState(false);
    const [isFailedVisible, setFailedVisible] = useState(false);

    // Tự động lấy danh sách danh mục khi component được tải
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get<Category[]>(`/categories?type=${type}`);
                setCategories(response.data);
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0]); // Mặc định chọn cái đầu tiên
                }
            } catch (error) {
                console.error(`Error fetching ${type} categories:`, error);
                Alert.alert('Lỗi', 'Không thể tải danh sách danh mục.');
            }
        };

        fetchCategories();
    }, [type]); // Chỉ chạy lại khi type thay đổi (income/expense)

    // Hàm để reset form sau khi thành công
    const resetForm = () => {
        setAmount('');
        setNote('');
        setDate(new Date());
        if (categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    };

    // Hàm xử lý khi nhấn nút "Nhập"
    const handleSave = async () => {
        const numericAmount = parseFloat(amount.replace(/,/g, ''));

        if (!numericAmount || numericAmount <= 0 || !selectedCategory) {
            setFailedVisible(true);
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/transactions', {
                amount: numericAmount,
                type: type,
                transaction_date: date.toISOString(), // Chuyển sang định dạng ISO string
                note: note,
                category_id: selectedCategory.id,
            });

            setSuccessVisible(true);
        } catch (error) {
            setFailedVisible(true);
            console.error('Error creating transaction:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccessClose = () => {
        setSuccessVisible(false);
        resetForm();
    };

    return {
        // Dữ liệu và state
        categories,
        selectedCategory,
        date,
        amount,
        note,
        isLoading,
        isSuccessVisible,
        isFailedVisible,
        // Hàm xử lý
        setSelectedCategory,
        setDate,
        setAmount,
        setNote,
        handleSave,
        handleSuccessClose,
        setFailedVisible,
    };
};
