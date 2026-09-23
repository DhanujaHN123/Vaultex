import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import PINPad from '../../components/PINPad';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '../../api/services/authService';
import useStore from '../../store/useStore';

const SetPINScreen = ({ navigation, route }) => {
  const { mobile, isReset } = route.params || {};
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();

  const handlePinChange = (val) => {
    setError('');
    if (step === 1) {
      setPin(val);
      if (val.length === 4) setTimeout(() => setStep(2), 300);
    } else {
      setConfirmPin(val);
      if (val.length === 4) setTimeout(() => handleSubmit(pin, val), 300);
    }
  };

  const handleSubmit = async (p, cp) => {
    if (p !== cp) {
      setError('PINs do not match. Please try again.');
      setStep(1);
      setPin('');
      setConfirmPin('');
      return;
    }
    setLoading(true);
    try {
      const fn = isReset ? authService.resetPin : authService.setPin;
      const res = await fn(mobile, p, cp);
      if (!isReset) {
        const { token, user, account } = res.data.data;
        await login(token, user, account);
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      } else {
        Alert.alert('Success', 'PIN reset successfully!', [{ text: 'Login', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'PINLogin' }] }) }]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set PIN. Please try again.');
      setStep(1); setPin(''); setConfirmPin('');
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
        <Text style={styles.title}>{isReset ? 'Reset PIN' : 'Set Your PIN'}</Text>
        <Text style={styles.sub}>{step === 1 ? 'Create a 4-digit secure PIN' : 'Confirm your PIN'}</Text>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step >= 1 && styles.stepActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.stepActive]} />
        </View>
        <Text style={styles.stepLabel}>{step === 1 ? 'Enter PIN' : 'Confirm PIN'}</Text>
        <ErrorMessage message={error} />
        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        ) : (
          <PINPad pin={step === 1 ? pin : confirmPin} onPinChange={handlePinChange} maxLength={4} />
        )}
        {step === 2 && <TouchableOpacity onPress={() => { setStep(1); setPin(''); setConfirmPin(''); }}><Text style={styles.backPin}>← Re-enter PIN</Text></TouchableOpacity>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 24, alignItems: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 6, textAlign: 'center' },
  sub: { fontSize: 15, color: COLORS.grayText, marginBottom: 24, textAlign: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.border },
  stepActive: { backgroundColor: COLORS.primary },
  stepLine: { width: 60, height: 2, backgroundColor: COLORS.border, marginHorizontal: 6 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginBottom: 28 },
  loadingBox: { padding: 40, alignItems: 'center' },
  loadingText: { fontSize: 16, color: COLORS.grayText },
  backPin: { color: COLORS.primary, fontSize: 14, fontWeight: '600', marginTop: 16 },
});

export default SetPINScreen;
