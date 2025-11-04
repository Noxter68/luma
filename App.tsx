import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { RevenueScreen } from './src/screens/RevenueScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AddIncomeScreen } from './src/screens/AddIncomeScreen';
import { RecurringExpensesScreen } from './src/screens/RecurringExpensesScreen';
import { AddRecurringScreen } from './src/screens/AddRecurringScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AddCategoryBudgetScreen } from './src/screens/AddCategoryBudgetScreen';
import { initDatabase } from './src/database';
import './src/i18n';
import { useTranslation } from './src/hooks/useTranslation';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Home, Wallet, PlusCircle, Repeat, Settings, DollarSign } from 'lucide-react-native';
import { CategorySelectorScreen } from './src/screens/CategorySelectorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDark ? colors.dark.surface : colors.light.bg,
          borderTopColor: isDark ? colors.dark.border : colors.light.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.dark.textTertiary : colors.light.textTertiary,
        headerStyle: {
          backgroundColor: isDark ? colors.dark.bg : colors.light.bg,
        },
        headerTintColor: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('home.title'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Revenue"
        component={RevenueScreen}
        options={{
          title: t('revenue.title'),
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: t('addExpense'),
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          headerShown: false,
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
  const { isDark, colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? colors.dark.bg : colors.light.bg,
        },
        headerTintColor: isDark ? colors.dark.textPrimary : colors.light.textPrimary,
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
      <Stack.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{
          title: t('revenue.addRevenue'),
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CategorySelector"
        component={CategorySelectorScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddCategoryBudget"
        component={AddCategoryBudgetScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isDark } = useTheme();

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
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
