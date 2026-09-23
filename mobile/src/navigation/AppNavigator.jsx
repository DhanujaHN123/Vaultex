import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';

import SendMoneyScreen from '../screens/send/SendMoneyScreen';
import ReceiveMoneyScreen from '../screens/receive/ReceiveMoneyScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BillsScreen from '../screens/bills/BillsScreen';
import InsuranceScreen from '../screens/insurance/InsuranceScreen';
import CardsScreen from '../screens/cards/CardsScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import InvestmentsScreen from '../screens/investments/InvestmentsScreen';
import LoansScreen from '../screens/loans/LoansScreen';
import EMICalculatorScreen from '../screens/loans/EMICalculatorScreen';
import HelpScreen from '../screens/help/HelpScreen';
import PayScreen from '../screens/pay/PayScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import SetPINScreen from '../screens/auth/SetPINScreen';
import PINLoginScreen from '../screens/auth/PINLoginScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPINScreen from '../screens/auth/ForgotPINScreen';

import useStore from '../store/useStore';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
          <Stack.Screen name="ReceiveMoney" component={ReceiveMoneyScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Bills" component={BillsScreen} />
          <Stack.Screen name="Insurance" component={InsuranceScreen} />
          <Stack.Screen name="Cards" component={CardsScreen} />
          <Stack.Screen name="Accounts" component={AccountsScreen} />
          <Stack.Screen name="Investments" component={InvestmentsScreen} />
          <Stack.Screen name="Loans" component={LoansScreen} />
          <Stack.Screen name="EMICalculator" component={EMICalculatorScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="Pay" component={PayScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="SetPIN" component={SetPINScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
