import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
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
import { SharedAddIncomeScreen } from './src/screens/SharedAddIncomeScreen';
import { SharedManageBudgetScreen } from './src/screens/SharedManageBudgetScreen';
import { ThemePaletteScreen } from './src/screens/ThemePaletteScreen';
import { ExpensesListScreen } from './src/screens/ExpensesListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icônes pour chaque tab
const TAB_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  Home,
  Revenue: Wallet,
  AddExpense: PlusCircle,
  Analytics: BarChart3,
  Settings,
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const TAB_COUNT = state.routes.length;
  const TAB_WIDTH = SCREEN_WIDTH / TAB_COUNT;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * TAB_WIDTH,
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
    }).start();
  }, [state.index]);

  return (
    <View
      style={[
        tw`absolute bottom-0 left-0 right-0`,
        {
          backgroundColor: isDark ? colors.dark.surface : colors.light.bg,
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.dark.border : colors.light.border,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 12,
        },
      ]}
    >
      {/* Slider animé avec ombre */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 8,
            width: TAB_WIDTH,
            height: 44,
            alignItems: 'center',
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View
          style={[
            tw`w-12 h-12 rounded-full items-center justify-center`,
            {
              backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}15`,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}
        />
      </Animated.View>

      {/* Tab buttons */}
      <View style={tw`flex-row`}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const IconComponent = TAB_ICONS[route.name];
          const label = options.title || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[tw`flex-1 items-center justify-center`, { height: 50 }]}
              activeOpacity={0.7}
            >
              {IconComponent && (
                <IconComponent
                  size={24}
                  color={isFocused ? colors.primary : isDark ? colors.dark.textTertiary : colors.light.textTertiary}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              )}
              <Text
                style={[
                  tw`text-xs mt-1 font-medium`,
                  {
                    color: isFocused ? colors.primary : isDark ? colors.dark.textTertiary : colors.light.textTertiary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TabNavigator() {
  const { t } = useTranslation();
  const { isDark, colors } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
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
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Revenue"
        component={RevenueScreen}
        options={{
          title: t('revenue.title'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          title: t('addExpense'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('analytics.title'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          headerShown: false,
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
          <Stack.Screen
            name="ThemePalette"
            component={ThemePaletteScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ExpensesList"
            component={ExpensesListScreen}
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
          <Stack.Screen
            name="SharedAddIncome"
            component={SharedAddIncomeScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SharedManageBudget"
            component={SharedManageBudgetScreen}
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
        <StatusBar style="light" />
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
