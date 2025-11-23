import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, moderateScale, verticalScale } from '../../utils/scaling';
import PopupDatePicker from './PopupDatePicker'; 

interface PopupExportOptionsProps {
  visible: boolean;
  onClose: () => void;
  onExport: (option: any) => void;
  isLoading: boolean;
}

type ExportType = 'all' | 'day' | 'month' | 'year' | 'custom';

const PopupExportOptions: React.FC<PopupExportOptionsProps> = ({ visible, onClose, onExport, isLoading }) => {
  const [exportType, setExportType] = useState<ExportType>('all');
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleConfirm = () => {
    onExport({
      type: exportType,
      date: selectedDate,
      startDate,
      endDate
    });
  };

  const renderTab = (type: ExportType, label: string) => (
    <TouchableOpacity 
      style={[styles.tab, exportType === type && styles.tabActive]} 
      onPress={() => setExportType(type)}
    >
      <Text style={[styles.tabText, exportType === type && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Tùy chọn xuất Excel</Text>

          <View style={styles.tabsContainer}>
            {renderTab('all', 'Tất cả')}
            {renderTab('day', 'Ngày')}
            {renderTab('month', 'Tháng')}
            {renderTab('year', 'Năm')}
            {renderTab('custom', 'Tùy chỉnh')}
          </View>

          <View style={styles.inputArea}>
            {exportType === 'day' && (
               <PopupDatePicker label="Chọn ngày" date={selectedDate} onDateChange={setSelectedDate} />
            )}

            {exportType === 'month' && (
               <PopupDatePicker label="Chọn tháng (chọn ngày bất kỳ trong tháng)" date={selectedDate} onDateChange={setSelectedDate} />
            )}

            {exportType === 'year' && (
               <PopupDatePicker label="Chọn năm (chọn ngày bất kỳ trong năm)" date={selectedDate} onDateChange={setSelectedDate} />
            )}

            {exportType === 'custom' && (
              <View>
                 <PopupDatePicker label="Từ ngày" date={startDate} onDateChange={setStartDate} />
                 <PopupDatePicker label="Đến ngày" date={endDate} onDateChange={setEndDate} />
              </View>
            )}
            
            {exportType === 'all' && (
                <Text style={styles.hintText}>Sẽ xuất toàn bộ dữ liệu hiện có.</Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={isLoading}>
               <Text style={styles.btnTextCancel}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirm} disabled={isLoading}>
               <Text style={styles.btnTextConfirm}>{isLoading ? 'Đang xuất...' : 'Xuất File'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', backgroundColor: '#fff', borderRadius: scale(20), padding: scale(20) },
  title: { fontFamily: 'Coiny-Regular', fontSize: moderateScale(18), color: '#04D1C1', textAlign: 'center', marginBottom: verticalScale(15) },
  tabsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: scale(8), marginBottom: verticalScale(20) },
  tab: { paddingVertical: verticalScale(8), paddingHorizontal: scale(12), borderRadius: scale(20), borderWidth: 1, borderColor: '#ddd', marginBottom: 5 },
  tabActive: { backgroundColor: '#04D1C1', borderColor: '#04D1C1' },
  tabText: { fontSize: moderateScale(13), color: '#666', fontFamily: 'BeVietnamPro-Medium' },
  tabTextActive: { color: '#fff' },
  inputArea: { backgroundColor: '#F9F9F9', padding: scale(15), borderRadius: scale(15), marginBottom: verticalScale(20) },
  hintText: { textAlign: 'center', color: '#666', fontFamily: 'BeVietnamPro-Italic' },
  footer: { flexDirection: 'row', gap: scale(15) },
  btnCancel: { flex: 1, padding: scale(12), borderRadius: scale(12), backgroundColor: '#f0f0f0', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: scale(12), borderRadius: scale(12), backgroundColor: '#04D1C1', alignItems: 'center' },
  btnTextCancel: { color: '#666', fontFamily: 'BeVietnamPro-Bold' },
  btnTextConfirm: { color: '#fff', fontFamily: 'BeVietnamPro-Bold' },
});

export default PopupExportOptions;