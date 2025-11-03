import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { AddExpenseScreen } from './src/screens/AddExpenseScreen';
import { initDatabase } from './src/database';

const Tab = createBottomTabNavigator();

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
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { backgroundColor: '#F5F2EB' },
            tabBarActiveTintColor: '#A3B18A',
            tabBarInactiveTintColor: '#DAD7CD',
            headerStyle: { backgroundColor: '#F5F2EB' },
            headerShadowVisible: false,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
          <Tab.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
          <Tab.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Ajouter' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
