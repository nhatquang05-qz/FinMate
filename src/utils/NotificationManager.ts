import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subWeeks, subMonths, isMonday, startOfWeek, endOfWeek, subYears } from 'date-fns';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string; 
  type: 'success' | 'report';
  isRead: boolean;
}

const NOTIFICATION_KEY = 'user_notifications';
const LAST_CHECK_KEY = 'last_report_check';

export const NotificationManager = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(NOTIFICATION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Error reading notifications", e);
      return [];
    }
  },

  addNotification: async (title: string, message: string, type: 'success' | 'report' = 'success') => {
    try {
      const currentNotifications = await NotificationManager.getNotifications();
      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        title,
        message,
        date: new Date().toISOString(),
        type,
        isRead: false,
      };
      
      const updatedNotifications = [newNotification, ...currentNotifications];
      await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updatedNotifications));
    } catch (e) {
      console.error("Error adding notification", e);
    }
  },

  checkAndGenerateReports: async () => {
    try {
      const lastCheckStr = await AsyncStorage.getItem(LAST_CHECK_KEY);
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      if (lastCheckStr !== todayStr) {
        
        if (isMonday(now)) {
          const lastWeekDate = subWeeks(now, 1);
          const start = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
          const end = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
          const rangeStr = `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;

          await NotificationManager.addNotification(
            'Báo cáo tuần',
            `Đã có báo cáo thu chi tuần trước (${rangeStr}). Xem ngay.`,
            'report'
          );
        }

        if (now.getDate() === 1) {
          const lastMonth = subMonths(now, 1);
          const lastMonthStr = format(lastMonth, 'MM/yyyy');
          
          await NotificationManager.addNotification(
            'Báo cáo tháng',
            `Đã có báo cáo thu chi tháng ${lastMonthStr}. Xem ngay.`,
            'report'
          );

           if (now.getMonth() === 0) { 
             const lastYear = subYears(now, 1);
             const lastYearStr = format(lastYear, 'yyyy');
             
             await NotificationManager.addNotification(
                'Báo cáo năm',
                `Đã có báo cáo thu chi năm ${lastYearStr}. Xem ngay.`,
                'report'
             );
           }
        }

        await AsyncStorage.setItem(LAST_CHECK_KEY, todayStr);
      }
    } catch (e) {
      console.error("Error generating reports", e);
    }
  }
};