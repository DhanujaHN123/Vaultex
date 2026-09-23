import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/LoadingSpinner';
import useStore from './src/store/useStore';

export default function App() {
  const { isLoading, loadAuthState } = useStore();

  useEffect(() => {
    loadAuthState();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Starting VaultX..." />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
