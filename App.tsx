import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { initDatabase } from './src/database';
import './src/i18n'; // Initialize i18n
import { useTranslation } from './src/hooks/useTranslation';
import { Home, Wallet, PlusCircle, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#F5F2EB' },
        tabBarActiveTintColor: '#A3B18A',
        tabBarInactiveTintColor: '#DAD7CD',
        headerStyle: { backgroundColor: '#F5F2EB' },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home.title'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          title: t('budget.title'),
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: t('addExpense'),
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    console.log('Initializing database...');
    try {
      initDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
