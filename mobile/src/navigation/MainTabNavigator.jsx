import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import PayScreen from '../screens/pay/PayScreen';
import MoreScreen from '../screens/dashboard/MoreScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grayText,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text> }}
      />
      <Tab.Screen
        name="PayTab"
        component={PayScreen}
        options={{ tabBarLabel: 'Pay', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📲</Text> }}
      />
      <Tab.Screen
        name="Services"
        component={MoreScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔲</Text> }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
