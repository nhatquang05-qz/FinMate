import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts';
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';
import RegisterScreen from '../screen/Register/Register';
import HomeScreen from '../screen/Home/Home';

ExpoSplashScreen.preventAutoHideAsync();

const App = () => {
  const fontsLoaded = useCustomFonts();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentScreen, setCurrentScreen] = useState('Login');

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  const navigateToRegister = () => {
    setCurrentScreen('Register');
  };

  const navigateToLogin = () => {
    setCurrentScreen('Login');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const renderContent = () => {
    if (isLoggedIn) {
      return <HomeScreen />;
    }

    if (currentScreen === 'Login') {
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
});

export default App;