import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '../../api/services/authService';

const ForgotPINScreen = ({ navigation, route }) => {
  const [mobile, setMobile] = useState(route.params?.mobile || '');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!/^\d{10}$/.test(mobile)) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    setApiError('');
    try {
      const res = await authService.forgotPin(mobile);
      const devOTP = res.data?.data?.devOTP;
      navigation.navigate('OTP', { mobile, purpose: 'forgot_pin', devOTP });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Forgot PIN</Text>
        <Text style={styles.sub}>Enter your registered mobile number to receive an OTP and reset your PIN.</Text>
        <ErrorMessage message={apiError} />
        <Input label="Mobile Number" value={mobile} onChangeText={(t) => { setMobile(t); setError(''); }} placeholder="10-digit mobile number" keyboardType="phone-pad" error={error} />
        <Button title="Send OTP" onPress={handle} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={() => navigation.navigate('PINLogin')} style={styles.link}>
          <Text style={styles.linkText}>Remembered PIN? <Text style={styles.linkBold}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  icon: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  sub: { fontSize: 15, color: COLORS.grayText, marginBottom: 28, lineHeight: 22 },
  btn: { marginTop: 8 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.grayText },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});

export default ForgotPINScreen;
