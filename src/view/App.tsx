import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts';
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';
import RegisterScreen from '../screen/Register/Register';
import HomeScreen from '../screen/Home/Home';
import AddTransactionScreen from '../screen/AddTransaction/AddTransactionScreen';
import Navbar from '../components/Navbar/Navbar';
import Header from '../components/Header/header';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scale } from '../utils/scaling';
import CalendarInfoScreen from '../screen/CalendarInfo';
import HistoryScreen from '../screen/HistoryScreen';
import ChartScreen from '../screen/Chart/ChartScreen';
import UserScreen from '../screen/User/UserScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

ExpoSplashScreen.preventAutoHideAsync();

// << 1. ĐỊNH NGHĨA PROPS CHO MainApp >>
interface MainAppProps {
  onLogout: () => void;
}

// << ĐỊNH NGHĨA KIỂU DỮ LIỆU CHO BỘ LỌC >>
type HistoryFilter = {
    categoryId: number;
    type: 'income' | 'expense';
};

const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
  const [activeScreen, setActiveScreen] = useState('Home');
  const [initialHistoryFilter, setInitialHistoryFilter] = useState<HistoryFilter | null>(null);

  const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{routeName} Screen</Text>
    </View>
  );

  const navigateToHistoryWithFilter = (filter: HistoryFilter) => {
      setInitialHistoryFilter(filter);
      setActiveScreen('History');
  };

  const clearHistoryFilter = () => {
      setInitialHistoryFilter(null);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen navigateTo={setActiveScreen} activeScreen={activeScreen} />;
      case 'Money':
        return <AddTransactionScreen />;
      case 'Calendar':
        return <CalendarInfoScreen />;
      case 'Chart':
        return <ChartScreen navigateToHistoryWithFilter={navigateToHistoryWithFilter} />;
      case 'History':
        return <HistoryScreen initialFilter={initialHistoryFilter} onClearFilter={clearHistoryFilter} />;
      case 'User':
        // << 2. SỬA LẠI THÀNH `onLogout` ĐỂ KHỚP VỚI PROP ĐÃ NHẬN >>
        return <UserScreen onLogout={onLogout} />;
      case 'Setting':
        return <PlaceholderScreen routeName="Setting" />;
      default:
        return <HomeScreen navigateTo={setActiveScreen} activeScreen={activeScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <ImageBackground 
        source={require('../assets/images/background.png')}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.safeArea}>
        <Header activeTab={activeScreen} />
        <View style={{ flex: 1 }}>
            {renderScreen()}
        </View>
        <Navbar 
          activeTab={activeScreen} 
          onTabPress={setActiveScreen} 
        />
      </View>
    </View>
  );
};

const App = () => {
  const fontsLoaded = useCustomFonts();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentAuthScreen, setCurrentAuthScreen] = useState('Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                setIsLoggedIn(true);
            }
        } catch (e) {
            console.error("Failed to fetch the token from storage", e);
        } finally {
            setIsLoading(false);
        }
    };
    checkToken();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return <SplashScreen />;
  }

  const navigateToRegister = () => {
    setCurrentAuthScreen('Register');
  };

  const navigateToLogin = () => {
    setCurrentAuthScreen('Login');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Xóa token ở đây không cần await vì không cần chờ nó xong
    AsyncStorage.removeItem('userToken');
  };

  const renderContent = () => {
    if (isLoggedIn) {
      // << 3. TRUYỀN `handleLogout` VÀO PROP `onLogout` CỦA MainApp >>
      return <MainApp onLogout={handleLogout} />;
    }

    if (currentAuthScreen === 'Login') {
      return (
        <LoginScreen
          onNavigateToRegister={navigateToRegister}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    } else {
      return (
        <RegisterScreen
          onNavigateToLogin={navigateToLogin}
        />
      );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {renderContent()}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: scale(24),
    fontWeight: 'bold',
  },
});

export default App;