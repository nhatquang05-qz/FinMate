import React, { useState } from 'react';
import DatePicker from 'react-native-date-picker';
import { scale } from '../../utils/scaling';

type DatePickerPopupProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    initialDate?: Date;
};

const PopupDatePicker = ({
    visible,
    onClose,
    onConfirm,
    initialDate = new Date(), 
}: DatePickerPopupProps) => {

    const [date, setDate] = useState(initialDate);

    const handleConfirm = () => {
        onConfirm(date);
        onClose();
    };

    return (
        <DatePicker
            modal
            open={visible}
            date={date}
            mode="date"
            locale="vi-VN" 
            title="Chọn ngày"
            confirmText="Tiếp tục"
            cancelText="Bỏ qua"
            onConfirm={handleConfirm}
            onCancel={onClose}
            onDateChange={setDate}
        />
    );
};

export default PopupDatePicker;