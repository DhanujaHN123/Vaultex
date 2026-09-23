import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import OTPInput from '../../components/OTPInput';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '../../api/services/authService';

const OTPScreen = ({ navigation, route }) => {
  const { mobile, purpose, name, devOTP } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyOTP(mobile, otp, purpose);
      if (purpose === 'forgot_pin') {
        navigation.navigate('SetPIN', { mobile, isReset: true });
      } else {
        navigation.navigate('SetPIN', { mobile, name });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await authService.sendOTP(mobile, purpose);
      setCountdown(60);
      setOtp('');
      const newDevOTP = res.data?.data?.devOTP;
      Alert.alert('OTP Sent', `A new OTP has been sent.${newDevOTP ? `\n\nDev OTP: ${newDevOTP}` : ''}`);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.sub}>Enter the 6-digit OTP sent to</Text>
        <Text style={styles.mobile}>+91 {mobile}</Text>
        {devOTP ? (
          <View style={styles.devBox}>
            <Text style={styles.devText}>🛠 Dev Mode OTP: <Text style={styles.devOTP}>{devOTP}</Text></Text>
          </View>
        ) : null}
        <ErrorMessage message={error} />
        <OTPInput value={otp} onChange={setOtp} length={6} />
        <Button title="Verify OTP" onPress={handleVerify} loading={loading} disabled={otp.length < 6} style={styles.btn} />
        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.countdown}>Resend OTP in <Text style={{ color: COLORS.primary }}>{countdown}s</Text></Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendBtn}>{resending ? 'Sending...' : 'Resend OTP'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  sub: { fontSize: 15, color: COLORS.grayText },
  mobile: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginBottom: 20 },
  devBox: { backgroundColor: '#FFF3CD', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FFD700' },
  devText: { fontSize: 13, color: '#7D5A00' },
  devOTP: { fontWeight: '800', fontSize: 15 },
  btn: { marginTop: 12 },
  resendRow: { alignItems: 'center', marginTop: 20 },
  countdown: { fontSize: 14, color: COLORS.grayText },
  resendBtn: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
});

export default OTPScreen;
