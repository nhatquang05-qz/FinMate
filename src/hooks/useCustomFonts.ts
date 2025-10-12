import { useFonts } from 'expo-font';

/**
 * Hook tùy chỉnh để tải và quản lý tất cả các font chữ trong ứng dụng.
 * Mọi font mới chỉ cần được thêm vào đây.
 */
export const useCustomFonts = () => {
  const [fontsLoaded, fontError] = useFonts({
    'BeVietnamPro-Black': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Black.ttf'),
    'BeVietnamPro-Bold': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Bold.ttf'),
    'BeVietnamPro-ExtraBold': require('../assets/fonts/Be-Vietnam/BeVietnamPro-ExtraBold.ttf'),
    'BeVietnamPro-ExtraLight': require('../assets/fonts/Be-Vietnam/BeVietnamPro-ExtraLight.ttf'),
    'BeVietnamPro-Italic': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Italic.ttf'),
    'BeVietnamPro-Light': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Light.ttf'),
    'BeVietnamPro-Medium': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Medium.ttf'),
    'BeVietnamPro-Regular': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Regular.ttf'),
    'BeVietnamPro-SemiBold': require('../assets/fonts/Be-Vietnam/BeVietnamPro-SemiBold.ttf'),
    'BeVietnamPro-Thin': require('../assets/fonts/Be-Vietnam/BeVietnamPro-Thin.ttf'),
    'Coiny-Regular': require('../assets/fonts/Coiny-Regular.ttf'),
  });

  // Bạn cũng có thể xử lý lỗi tải font ở đây nếu cần
  if (fontError) {
    console.error("Lỗi khi tải font:", fontError);
  }

  return fontsLoaded;
};
