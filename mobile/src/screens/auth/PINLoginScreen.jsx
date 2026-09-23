import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import PINPad from '../../components/PINPad';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { authService } from '../../api/services/authService';
import useStore from '../../store/useStore';
import { formatMobile, maskAccountNumber } from '../../utils/formatters';

const DEMO_ACCOUNTS = [
  { name: 'Aarav Sharma (Demo)', mobile: '9876543210' },
  { name: 'Priya Patel (Demo)', mobile: '9876543211' },
];

const PINLoginScreen = ({ navigation }) => {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [mobile, setMobile] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { login, getSavedAccounts } = useStore();

  useEffect(() => {
    loadSavedAccounts();
  }, []);

  const loadSavedAccounts = async () => {
    try {
      const accounts = await getSavedAccounts();
      setSavedAccounts(accounts || []);
      if (accounts && accounts.length === 1) {
        setSelectedAccount(accounts[0]);
        setMobile(accounts[0].mobile);
      } else if (!accounts || accounts.length === 0) {
        // No saved accounts on this device: default directly to manual phone number input
        setIsManualInput(true);
        // Pre-fill demo phone number so the user can immediately test with 1 tap or type any number
        setMobile('9876543210');
      }
    } catch (e) {
      setIsManualInput(true);
      setMobile('9876543210');
    }
    setInitializing(false);
  };

  const handleSelectSavedAccount = (acc) => {
    setSelectedAccount(acc);
    setMobile(acc.mobile);
    setPin('');
    setError('');
  };

  const handleSelectDemo = (demo) => {
    setMobile(demo.mobile);
    setSelectedAccount({ name: demo.name, mobile: demo.mobile });
    setPin('');
    setError('');
  };

  const handlePinChange = async (val) => {
    setPin(val);
    setError('');
    if (val.length === 4) {
      await handleLogin(val);
    }
  };

  const handleLogin = async (pinVal) => {
    const targetMobile = (selectedAccount?.mobile || mobile || '').trim();
    if (!targetMobile || !/^\d{10}$/.test(targetMobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      setPin('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authService.login(targetMobile, pinVal);
      const { token, user, account } = res.data.data;
      // Saves token, user, and stores account in local saved accounts list
      await login(token, user, account);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message?.includes('Network Error')
          ? 'Network Error: Cannot connect to server. Check your connection.'
          : err.message) ||
        'Invalid PIN. Please try again.';
      setError(errorMsg);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return <LoadingSpinner fullScreen message="Loading..." />;

  const activeMobile = selectedAccount?.mobile || mobile;
  const isMobileValid = /^\d{10}$/.test(activeMobile);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.sub}>
          {savedAccounts.length > 0 && !isManualInput
            ? 'Select account and enter your PIN'
            : 'Enter your registered mobile number and PIN'}
        </Text>

        <ErrorMessage message={error} />

        {/* 1. Saved Accounts Section (shown if saved accounts exist and not in manual entry mode) */}
        {savedAccounts.length > 0 && !isManualInput && (
          <View style={styles.accountsSection}>
            <Text style={styles.sectionLabel}>Saved Accounts</Text>
            {savedAccounts.map((acc, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.accountCard, selectedAccount?.mobile === acc.mobile && styles.accountSelected]}
                onPress={() => handleSelectSavedAccount(acc)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{acc.name?.[0]?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.accInfo}>
                  <Text style={styles.accName}>{acc.name}</Text>
                  <Text style={styles.accMobile}>{formatMobile(acc.mobile)}</Text>
                  {acc.accountNumber ? <Text style={styles.accNum}>{maskAccountNumber(acc.accountNumber)}</Text> : null}
                </View>
                {selectedAccount?.mobile === acc.mobile && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => {
                setIsManualInput(true);
                setSelectedAccount(null);
                setPin('');
                setError('');
              }}
            >
              <Text style={styles.switchModeText}>➕ Login with another number</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 2. Manual Phone Number Input Section (shown when no saved accounts or user chose manual) */}
        {(savedAccounts.length === 0 || isManualInput) && (
          <View style={styles.inputSection}>
            <Input
              label="Registered Mobile Number"
              value={mobile}
              onChangeText={(t) => {
                const cleaned = t.replace(/[^0-9]/g, '').slice(0, 10);
                setMobile(cleaned);
                if (selectedAccount && selectedAccount.mobile !== cleaned) {
                  setSelectedAccount(null);
                }
                setPin('');
                setError('');
              }}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
            />

            {/* Quick Demo Account Selector for Demo Ease */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>⚡ Quick Demo Account:</Text>
              <View style={styles.demoChipsRow}>
                {DEMO_ACCOUNTS.map((demo) => (
                  <TouchableOpacity
                    key={demo.mobile}
                    style={[styles.demoChip, mobile === demo.mobile && styles.demoChipActive]}
                    onPress={() => handleSelectDemo(demo)}
                  >
                    <Text style={[styles.demoChipText, mobile === demo.mobile && styles.demoChipTextActive]}>
                      👤 {demo.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {savedAccounts.length > 0 && (
              <TouchableOpacity
                style={styles.switchModeBtn}
                onPress={() => {
                  setIsManualInput(false);
                  if (savedAccounts.length > 0) {
                    handleSelectSavedAccount(savedAccounts[0]);
                  }
                }}
              >
                <Text style={styles.switchModeText}>← Choose from saved accounts</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 3. PIN Pad Section (Active when mobile number has 10 digits) */}
        {isMobileValid ? (
          <View style={styles.pinSection}>
            <Text style={styles.pinLabel}>
              Enter 4-digit PIN for{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                {selectedAccount?.name ? selectedAccount.name : `+91 ${activeMobile}`}
              </Text>
            </Text>

            {loading ? (
              <View style={styles.loadingBox}>
                <LoadingSpinner />
                <Text style={styles.loadingText}>Authenticating with VaultX...</Text>
              </View>
            ) : (
              <PINPad pin={pin} onPinChange={handlePinChange} maxLength={4} />
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPIN', { mobile: activeMobile })}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot PIN?</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>Enter your 10-digit mobile number to proceed with PIN login</Text>
          </View>
        )}

        {/* Create Account Link */}
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')} style={styles.createLinkBtn}>
          <Text style={styles.createLinkText}>
            Don't have an account? <Text style={styles.createLinkBold}>Create Account</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 24 },
  back: { alignSelf: 'flex-start', marginBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.grayText, marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.grayText, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  accountsSection: { marginBottom: 16 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: COLORS.border, elevation: 1 },
  accountSelected: { borderColor: COLORS.primary, backgroundColor: '#F0FAF9' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  accInfo: { flex: 1 },
  accName: { fontSize: 16, fontWeight: '700', color: COLORS.darkText },
  accMobile: { fontSize: 13, color: COLORS.grayText, marginTop: 2 },
  accNum: { fontSize: 12, color: COLORS.grayText },
  checkMark: { color: COLORS.primary, fontSize: 22, fontWeight: '700' },
  switchModeBtn: { paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  switchModeText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  inputSection: { marginBottom: 12 },
  demoSection: { marginTop: -4, marginBottom: 14 },
  demoLabel: { fontSize: 12, fontWeight: '600', color: COLORS.grayText, marginBottom: 6 },
  demoChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  demoChip: { backgroundColor: '#E8F5F3', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: COLORS.primary + '50' },
  demoChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  demoChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  demoChipTextActive: { color: '#fff', fontWeight: '700' },
  pinSection: { alignItems: 'center', marginTop: 6 },
  pinLabel: { fontSize: 14, color: COLORS.darkText, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  loadingBox: { padding: 30, alignItems: 'center' },
  loadingText: { fontSize: 14, color: COLORS.grayText, marginTop: 10 },
  forgotBtn: { marginTop: 16 },
  forgotText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  promptBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', marginVertical: 14, borderWidth: 1, borderColor: COLORS.border },
  promptText: { fontSize: 13, color: COLORS.grayText, textAlign: 'center' },
  createLinkBtn: { alignItems: 'center', marginTop: 24, paddingVertical: 10 },
  createLinkText: { fontSize: 14, color: COLORS.grayText },
  createLinkBold: { color: COLORS.primary, fontWeight: '700' },
});

export default PINLoginScreen;
