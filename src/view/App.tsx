import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts';
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';
import RegisterScreen from '../screen/Register/Register';
import HomeScreen from '../screen/Home/Home';
import AddTransaction from '../screen/AddTransaction';
import Navbar from '../components/Navbar/Navbar';
import Header from '../components/Header/header';

ExpoSplashScreen.preventAutoHideAsync();

const MainApp = () => {
  const [activeScreen, setActiveScreen] = useState('Home');

  const PlaceholderScreen = ({ routeName }: { routeName: string }) => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{routeName} Screen</Text>
    </View>
  );

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen />;
      case 'Money':
        return <AddTransaction />;
      case 'Calendar':
        return <PlaceholderScreen routeName="Calendar" />;
      case 'Chart':
        return <PlaceholderScreen routeName="Chart" />;
      case 'User':
        return <PlaceholderScreen routeName="User" />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground 
        source={require('../assets/images/background.png')}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea}>
        <Header activeTab={activeScreen} />
        <View style={{ flex: 1 }}>
            {renderScreen()}
        </View>
        <Navbar 
          activeTab={activeScreen} 
          onTabPress={setActiveScreen} 
        />
      </SafeAreaView>
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
    <View style={styles.container} onLayout={onLayoutRootView}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFF',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;