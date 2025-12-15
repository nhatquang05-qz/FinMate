import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useCustomFonts } from '../hooks/useCustomFonts';
import SplashScreen from '../screen/SplashScreen';
import LoginScreen from '../screen/Login';
import RegisterScreen from '../screen/Register';
import HomeScreen from '../screen/Home';
import AddTransactionScreen from '../screen/AddTransaction/AddTransactionScreen';
import Navbar from '../components/Navbar/Navbar';
import Header from '../components/Header/header';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scale } from '../utils/scaling';
import CalendarInfoScreen from '../screen/CalendarInfo';
import HistoryScreen from '../screen/HistoryScreen';
import ChartScreen from '../screen/ChartScreen';
import UserScreen from '../screen/UserScreen';
import ProfileScreen from '../screen/ProfileScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarScreen from '../screen/CalendarScreen';
import NotificationScreen from '../screen/NotificationScreen';
import { NotificationManager } from '../utils/NotificationManager';
import SettingScreen from '../screen/SettingScreen';
import ChatScreen from '../screen/ChatScreen';
import GoalScreen from '../screen/GoalScreen';
import BudgetScreen from '../screen/BudgetScreen';
import RecurringListScreen from '../screen/RecurringListScreen';

ExpoSplashScreen.preventAutoHideAsync();

interface MainAppProps {
    onLogout: () => void;
}

type HistoryFilter = {
    categoryId: number;
    type: 'income' | 'expense';
};

const MainApp: React.FC<MainAppProps> = ({ onLogout }) => {
    const [activeScreen, setActiveScreen] = useState('Home');
    const [currentUserScreen, setCurrentUserScreen] = useState('UserRoot');
    const [initialHistoryFilter, setInitialHistoryFilter] = useState<HistoryFilter | null>(null);

    useEffect(() => {
        NotificationManager.checkAndGenerateReports();
    }, []);

    const navigateToHistoryWithFilter = (filter: HistoryFilter) => {
        setInitialHistoryFilter(filter);
        setActiveScreen('History');
    };

    const clearHistoryFilter = () => {
        setInitialHistoryFilter(null);
    };

    const handleNavigateFromNotification = () => {
        setActiveScreen('Chart');
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'Home':
                return <HomeScreen navigateTo={setActiveScreen} activeScreen={activeScreen} />;
            case 'Money':
                return <AddTransactionScreen />;
            case 'Calendar':
                return <CalendarScreen />;
            case 'Chart':
                return <ChartScreen navigateToHistoryWithFilter={navigateToHistoryWithFilter} />;
            case 'History':
                return (
                    <HistoryScreen
                        initialFilter={initialHistoryFilter}
                        onClearFilter={clearHistoryFilter}
                    />
                );
            case 'Goal':
                return <GoalScreen />;
            case 'User':
                if (currentUserScreen === 'Profile') {
                    return <ProfileScreen onBack={() => setCurrentUserScreen('UserRoot')} />;
                }
                if (currentUserScreen === 'Recurring') {
                    return <RecurringListScreen onBack={() => setCurrentUserScreen('UserRoot')} />;
                }
                return (
                    <UserScreen
                        onLogout={onLogout}
                        navigateToSubScreen={setCurrentUserScreen}
                        onNavigateToSettings={() => setActiveScreen('Setting')}
                    />
                );
            case 'Notification':
                return <NotificationScreen onNavigateToReport={handleNavigateFromNotification} />;
            case 'Setting':
                return <SettingScreen onNavigateToBudget={() => setActiveScreen('Budget')} />;
            case 'Budget':
                return <BudgetScreen onBack={() => setActiveScreen('Setting')} />;
            case 'Finpet':
                return <ChatScreen onBack={() => setActiveScreen('Home')} />;
            default:
                return <HomeScreen navigateTo={setActiveScreen} activeScreen={activeScreen} />;
        }
    };

    const isUserSubScreen = activeScreen === 'User' && currentUserScreen !== 'UserRoot';
    const shouldShowHeader =
        activeScreen !== 'Finpet' && activeScreen !== 'Budget' && !isUserSubScreen;

    const shouldShowNavbar = activeScreen !== 'Finpet' && activeScreen !== 'Budget';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            {activeScreen !== 'Finpet' && (
                <ImageBackground
                    source={require('../assets/images/background.png')}
                    style={StyleSheet.absoluteFillObject}
                />
            )}
            <View style={styles.safeArea}>
                {shouldShowHeader && (
                    <Header
                        activeTab={activeScreen}
                        onNotificationPress={() => setActiveScreen('Notification')}
                    />
                )}

                <View style={{ flex: 1 }}>{renderScreen()}</View>

                {shouldShowNavbar && (
                    <Navbar activeTab={activeScreen} onTabPress={setActiveScreen} />
                )}
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
                console.error('Failed to fetch the token from storage', e);
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

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setIsLoggedIn(false);
        } catch (e) {
            console.error('Failed to remove token on logout', e);
            setIsLoggedIn(false);
        }
    };

    const renderContent = () => {
        if (isLoggedIn) {
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
            return <RegisterScreen onNavigateToLogin={navigateToLogin} />;
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
