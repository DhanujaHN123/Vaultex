import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '../../api/services/authService';

const CreateAccountScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const res = await authService.register(name.trim(), mobile.trim());
      const { devOTP } = res.data.data;
      navigation.navigate('OTP', { mobile: mobile.trim(), purpose: 'register', name: name.trim(), devOTP });
    } catch (err) {
      const msg = err.response?.data?.message || (err.message?.includes('Network Error') ? 'Network Error: Cannot connect to server. Ensure phone & laptop are on the same Wi-Fi.' : err.message) || 'Registration failed. Please try again.';
      setApiError(msg);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join VaultX and start banking smarter</Text>
        <ErrorMessage message={apiError} />
        <Input label="Full Name" value={name} onChangeText={setName} placeholder="Enter your full name" error={errors.name} />
        <Input label="Mobile Number" value={mobile} onChangeText={setMobile} placeholder="10-digit mobile number" keyboardType="phone-pad" error={errors.mobile} />
        <Text style={styles.note}>We'll send an OTP to verify your mobile number</Text>
        <Button title="Send OTP" onPress={handleRegister} loading={loading} style={styles.btn} />
        <TouchableOpacity onPress={() => navigation.navigate('PINLogin')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
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
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  sub: { fontSize: 15, color: COLORS.grayText, marginBottom: 28 },
  note: { fontSize: 13, color: COLORS.grayText, marginBottom: 8, textAlign: 'center' },
  btn: { marginTop: 8 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: COLORS.grayText },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});

export default CreateAccountScreen;
