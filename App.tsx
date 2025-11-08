import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { RevenueScreen } from './src/screens/RevenueScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { AddIncomeScreen } from './src/screens/AddIncomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AddCategoryBudgetScreen } from './src/screens/AddCategoryBudgetScreen';
import { CategorySelectorScreen } from './src/screens/CategorySelectorScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SharedAccountDetailsScreen } from './src/screens/SharedAccountDetailsScreen';
import { CreateSharedAccountScreen } from './src/screens/CreateSharedAccountScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { initDatabase } from './src/database';
import './src/i18n';
import { useTranslation } from './src/hooks/useTranslation';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AuthProvider, useAuthContext } from './src/contexts/AuthContext';
import { Home, Wallet, PlusCircle, Settings, BarChart3 } from 'lucide-react-native';
import tw from './src/lib/tailwind';
import { SharedAccountSettingsScreen } from './src/screens/SharedAccountSettingsScreen';
import { SharedAddExpenseScreen } from './src/screens/SharedAddExpenseScreen';

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
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('analytics.title'),
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          headerShown: false,
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
  const { user, loading } = useAuthContext();

  // Loading state
  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
      {/* Si l'utilisateur n'est pas connecté, montrer l'écran de login */}
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
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
          {/* 🆕 Shared Account Screens */}
          <Stack.Screen
            name="SharedAccountDetails"
            component={SharedAccountDetailsScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="CreateSharedAccount"
            component={CreateSharedAccountScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SharedAccountSettings"
            component={SharedAccountSettingsScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SharedAddExpense"
            component={SharedAddExpenseScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </>
      )}
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
