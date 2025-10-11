import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native'; // Thêm StyleSheet

// Splash Screen
import SplashScreen from '../screen/SplashScreen';

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsAppReady(true);
    }, 3000); 
  }, []);

  if (!isAppReady) {
    return <SplashScreen />;
  }
  return (
  //Sau khi SplashScreen xong sẽ tới trang chủ
  <Text>Welcome to Finmate</Text> 
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default App;