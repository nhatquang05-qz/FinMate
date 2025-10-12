import React, { useCallback } from 'react';
import { View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts'; 
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login/Login';

ExpoSplashScreen.preventAutoHideAsync();

const App = () => {
  const fontsLoaded = useCustomFonts();
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await ExpoSplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) {
    return <SplashScreen />;
  }
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <LoginScreen />
    </View>
  );
};

export default App;

