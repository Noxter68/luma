import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { RecurringExpensesScreen } from './src/screens/RecurringExpensesScreen';
import { AddRecurringScreen } from './src/screens/AddRecurringScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { initDatabase } from './src/database';
import './src/i18n'; // Initialize i18n
import { useTranslation } from './src/hooks/useTranslation';
import { Home, Wallet, PlusCircle, Repeat, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
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
        name="Recurring"
        component={RecurringExpensesScreen}
        options={{
          title: t('recurringExpenses'),
          tabBarIcon: ({ color, size }) => <Repeat size={size} color={color} />,
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

function AppNavigator() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F5F2EB' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddRecurring"
        component={AddRecurringScreen}
        options={{
          title: t('addRecurringExpense'),
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
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
