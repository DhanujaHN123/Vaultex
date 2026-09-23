import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/auth/SplashScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import SetPINScreen from '../screens/auth/SetPINScreen';
import PINLoginScreen from '../screens/auth/PINLoginScreen';
import ForgotPINScreen from '../screens/auth/ForgotPINScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="SetPIN" component={SetPINScreen} />
      <Stack.Screen name="PINLogin" component={PINLoginScreen} />
      <Stack.Screen name="ForgotPIN" component={ForgotPINScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
