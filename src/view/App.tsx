import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts'; 
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';
import RegisterScreen from '../screen/Register/Register'; 

ExpoSplashScreen.preventAutoHideAsync();

const App = () => {
  const fontsLoaded = useCustomFonts();
  
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

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {currentScreen === 'Login' ? (
        <LoginScreen onNavigateToRegister={navigateToRegister} />
      ) : (
        <RegisterScreen onNavigateToLogin={navigateToLogin} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;