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
  <Text style={styles.mainContainer}>Welcome to Finmate</Text> 
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
  }
});

export default App;