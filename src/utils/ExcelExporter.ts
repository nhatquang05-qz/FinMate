import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import apiClient from '../api/apiClient';
import { Alert } from 'react-native';

export const exportToExcel = async () => {
  try {
    const response = await apiClient.get('/transactions'); 
    const transactions = response.data;

    if (!transactions || transactions.length === 0) {
      Alert.alert("Thông báo", "Không có dữ liệu để xuất.");
      return;
    }

    const formattedData = transactions.map((item: any) => ({
      "Mã GD": item.id,
      "Ngày": new Date(item.date).toLocaleDateString('vi-VN'),
      "Loại": item.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      "Danh mục": item.category_name || item.category?.name || 'Khác',
      "Số tiền": item.amount,
      "Ghi chú": item.note || '',
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichSuGiaoDich");
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileName = `FinMate_Report_${new Date().getTime()}.xlsx`;
    const FS = FileSystem as any;    
    const directory = FS.cacheDirectory || FS.documentDirectory;
    const uri = directory + fileName;

    await FS.writeAsStringAsync(uri, wbout, {
      encoding: 'base64' 
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Xuất dữ liệu giao dịch',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } else {
      Alert.alert("Lỗi", "Thiết bị không hỗ trợ tính năng chia sẻ.");
    }

  } catch (error) {
    console.error("Export error:", error);
    Alert.alert("Lỗi xuất file", String(error));
  }
};