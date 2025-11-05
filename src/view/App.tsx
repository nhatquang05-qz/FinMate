import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts';
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';
import RegisterScreen from '../screen/Register/Register';
import HomeScreen from '../screen/Home/Home';
import HistoryScreen from '../screen/HistoryScreen';
import AddTransactionScreen from '../screen/AddTransaction/AddTransactionScreen';
import Navbar from '../components/Navbar/Navbar';
import Header from '../components/Header/header';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scale } from '../utils/scaling';
import CalendarInfoScreen from '../screen/CalendarInfo';
import ChartScreen from '../screen/Chart/ChartScreen';
ExpoSplashScreen.preventAutoHideAsync();

type HistoryFilter = {
    categoryId: number;
    type: 'income' | 'expense';
};

const MainApp = () => {
  const [activeScreen, setActiveScreen] = useState('Home');
  const [initialHistoryFilter, setInitialHistoryFilter] = useState<HistoryFilter | null>(null);

  const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{routeName} Screen</Text>
    </View>
  );

  const navigateToHistoryWithFilter = (filter: HistoryFilter) => {
      setInitialHistoryFilter(filter); // Lưu bộ lọc
      setActiveScreen('History');     // Chuyển màn hình
  };

  const clearHistoryFilter = () => {
      setInitialHistoryFilter(null); // Xóa bộ lọc sau khi đã dùng
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen navigateTo={setActiveScreen} />;
      case 'Money':
        return <AddTransactionScreen />;
      case 'Calendar':
        return <CalendarInfoScreen />;
      case 'Chart':
        return <ChartScreen navigateToHistoryWithFilter={navigateToHistoryWithFilter} />;
      case 'User':
        return <PlaceholderScreen routeName="User" />;
      case 'History':
        return <HistoryScreen initialFilter={initialHistoryFilter} onClearFilter={clearHistoryFilter} />;
      case 'Statistic':
        return <PlaceholderScreen routeName="Statistic" />;
      case 'Setting':
        return <PlaceholderScreen routeName="Setting" />;
      default:
        return <HomeScreen navigateTo={setActiveScreen} />;
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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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

  const renderContent = () => {
    if (isLoggedIn) {
      return <MainApp />;
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
