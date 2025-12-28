import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    format,
    subWeeks,
    subMonths,
    isMonday,
    startOfWeek,
    endOfWeek,
    differenceInDays,
} from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

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
const GOAL_NOTIFIED_KEY = 'goal_notified_history';
const BUDGET_NOTIFIED_KEY = 'budget_notified_history';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationManager = {
    getNotifications: async (): Promise<NotificationItem[]> => {
        try {
            const jsonValue = await AsyncStorage.getItem(NOTIFICATION_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Error reading notifications', e);
            return [];
        }
    },

    addNotification: async (
        title: string,
        message: string,
        type: 'success' | 'report' = 'success',
    ) => {
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
            console.error('Error adding notification', e);
        }
    },

    requestPermissions: async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    },

    scheduleDailyReminder: async () => {
        const hasPermission = await NotificationManager.requestPermissions();
        if (!hasPermission) {
            return false;
        }

        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Nhắc nhở nhập liệu 📝',
                    body: 'Bạn đã chi tiêu gì hôm nay chưa? Hãy ghi lại ngay nhé!',
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 20,
                    minute: 0,
                },
            });
            console.log('✅ Đã lên lịch nhắc nhở 20:00 hàng ngày');
            return true;
        } catch (error) {
            console.error('❌ Lỗi khi đặt thông báo:', error);
            return false;
        }
    },

    cancelAllNotifications: async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('✅ Đã hủy tất cả thông báo');
        } catch (error) {
            console.error('Error canceling notifications:', error);
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
                        `Đã có báo cáo thu chi tuần trước (${rangeStr}).`,
                        'report',
                    );
                }
                if (now.getDate() === 1) {
                    const lastMonth = subMonths(now, 1);
                    const lastMonthStr = format(lastMonth, 'MM/yyyy');
                    await NotificationManager.addNotification(
                        'Báo cáo tháng',
                        `Đã có báo cáo thu chi tháng ${lastMonthStr}.`,
                        'report',
                    );
                }
                await AsyncStorage.setItem(LAST_CHECK_KEY, todayStr);
            }
        } catch (e) {
            console.error('Error generating reports', e);
        }
    },

    checkGoalDeadlines: async (goals: any[]) => {
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');

        let notifiedHistory: Record<string, string> = {};
        try {
            const historyJson = await AsyncStorage.getItem(GOAL_NOTIFIED_KEY);
            if (historyJson) notifiedHistory = JSON.parse(historyJson);
        } catch (e) {
            console.error(e);
        }

        let hasNewNotification = false;

        for (const goal of goals) {
            if (goal.current_amount >= goal.target_amount) continue;

            if (notifiedHistory[goal.id] === todayStr) continue;

            const deadline = new Date(goal.deadline);
            const daysLeft = differenceInDays(deadline, today);

            if (daysLeft <= 3 && daysLeft >= 0) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: '⏰ Sắp đến hạn!',
                        body: `Mục tiêu "${goal.name}" chỉ còn ${daysLeft} ngày.`,
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                    },
                    trigger: null,
                });

                notifiedHistory[goal.id] = todayStr;
                hasNewNotification = true;
            }
        }

        if (hasNewNotification) {
            await AsyncStorage.setItem(GOAL_NOTIFIED_KEY, JSON.stringify(notifiedHistory));
        }
    },

    sendCongratulation: async (goalName: string) => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 CHÚC MỪNG!',
                body: `Tuyệt vời! Bạn đã hoàn thành mục tiêu "${goalName}".`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
        });

        await NotificationManager.addNotification(
            'Mục tiêu hoàn thành!',
            `Chúc mừng bạn đã hoàn thành mục tiêu "${goalName}".`,
            'success',
        );
    },

    checkBudgetExceeded: async (categories: any[]) => {
        const now = new Date();
        const currentMonthStr = format(now, 'yyyy-MM');

        let budgetHistory: Record<string, string> = {};

        try {
            const historyJson = await AsyncStorage.getItem(BUDGET_NOTIFIED_KEY);
            if (historyJson) budgetHistory = JSON.parse(historyJson);
        } catch (e) {
            console.error('Error reading budget history', e);
        }

        let hasChange = false;

        for (const cat of categories) {
            if (!cat.budgetLimit || cat.budgetLimit === 0) continue;

            const percent = (cat.totalAmount / cat.budgetLimit) * 100;
            const historyKey = `${cat.id}_${currentMonthStr}`;
            const lastNotifiedLevel = budgetHistory[historyKey] || '0';

            if (percent >= 100) {
                if (lastNotifiedLevel !== '100') {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '⚠️ Vượt hạn mức chi tiêu!',
                            body: `Bạn đã chi vượt quá ngân sách cho danh mục "${cat.categoryName}".`,
                        },
                        trigger: null,
                    });

                    budgetHistory[historyKey] = '100';
                    hasChange = true;
                }
            } else if (percent >= 80) {
                if (lastNotifiedLevel !== '80' && lastNotifiedLevel !== '100') {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'Cảnh báo ngân sách',
                            body: `Bạn đã dùng ${Math.round(percent)}% ngân sách cho "${cat.categoryName}".`,
                        },
                        trigger: null,
                    });

                    budgetHistory[historyKey] = '80';
                    hasChange = true;
                }
            }
        }

        if (hasChange) {
            await AsyncStorage.setItem(BUDGET_NOTIFIED_KEY, JSON.stringify(budgetHistory));
        }
    },
};
