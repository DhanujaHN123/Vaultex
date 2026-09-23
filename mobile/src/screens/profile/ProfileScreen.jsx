import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { userService } from '../../api/services/userService';
import useStore from '../../store/useStore';
import { formatCurrency, maskAccountNumber, formatMobile } from '../../utils/formatters';
import * as Clipboard from 'expo-clipboard';

const Row = ({ label, value, onCopy }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      <Text style={styles.rowValue}>{value}</Text>
      {onCopy && <TouchableOpacity onPress={onCopy} style={styles.copyBtn}><Text style={styles.copyIcon}>📋</Text></TouchableOpacity>}
    </View>
  </View>
);

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const SettingRow = ({ icon, label, onPress, danger, rightEl }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <Text style={styles.settingIcon}>{icon}</Text>
    <Text style={[styles.settingLabel, danger && { color: COLORS.error }]}>{label}</Text>
    {rightEl || <Text style={styles.chevron}>›</Text>}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { user, account, logout } = useStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getProfile().then(r => {
      setProfileData(r.data.data);
    }).catch(e => {
      setError('Failed to load profile.');
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Auth' }] }); } },
    ]);
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading profile..." />;

  const u = profileData?.user || user;
  const acc = profileData?.account || account;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{u?.name?.[0]?.toUpperCase() || 'U'}</Text></View>
          <Text style={styles.userName}>{u?.name}</Text>
          <Text style={styles.userMobile}>{formatMobile(u?.mobile)}</Text>
          <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✅ Verified Account</Text></View>
        </View>

        <ErrorMessage message={error} />

        {/* Account Details */}
        <Section title="Account Details">
          <Row label="Account Number" value={acc?.accountNumber || u?.accountNumber || 'N/A'} onCopy={() => copyToClipboard(acc?.accountNumber || u?.accountNumber || '', 'Account number')} />
          <Row label="Account Type" value={acc?.type ? acc.type.charAt(0).toUpperCase() + acc.type.slice(1) : 'Savings'} />
          <Row label="IFSC Code" value={acc?.ifsc || 'VLTX0001234'} onCopy={() => copyToClipboard(acc?.ifsc || 'VLTX0001234', 'IFSC code')} />
          <Row label="Bank Name" value={acc?.bankName || 'VaultX Bank'} />
          <Row label="Available Balance" value={formatCurrency(u?.balance || 0)} />
          <Row label="UPI ID" value={`${u?.mobile}@vaultx`} onCopy={() => copyToClipboard(`${u?.mobile}@vaultx`, 'UPI ID')} />
        </Section>

        {/* Security */}
        <Section title="Security">
          <SettingRow icon="🔑" label="Change PIN" onPress={() => navigation.navigate('SetPIN', { mobile: u?.mobile, isReset: false })} />
          <SettingRow icon="👤" label="Edit Profile" onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon!')} />
        </Section>

        {/* Account */}
        <Section title="My Banking">
          <SettingRow icon="🏦" label="My Accounts" onPress={() => navigation.navigate('Accounts')} />
          <SettingRow icon="💳" label="My Cards" onPress={() => navigation.navigate('Cards')} />
          <SettingRow icon="📊" label="Transaction History" onPress={() => navigation.navigate('History')} />
        </Section>

        {/* Support */}
        <Section title="Support">
          <SettingRow icon="❓" label="Help & Support" onPress={() => navigation.navigate('Help')} />
          <SettingRow icon="📄" label="Terms & Conditions" onPress={() => Alert.alert('Terms & Conditions', 'By using VaultX, you agree to our terms of service. VaultX provides secure digital banking services.')} />
          <SettingRow icon="🔒" label="Privacy Policy" onPress={() => Alert.alert('Privacy Policy', 'VaultX is committed to protecting your privacy. Your data is encrypted and never shared with third parties.')} />
        </Section>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  back: {},
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  avatarSection: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 4 },
  avatarText: { color: '#fff', fontSize: 38, fontWeight: '700' },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  userMobile: { fontSize: 15, color: COLORS.grayText, marginBottom: 10 },
  verifiedBadge: { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 5 },
  verifiedText: { color: COLORS.success, fontWeight: '700', fontSize: 13 },
  section: { marginHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.grayText, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 14, color: COLORS.grayText, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, color: COLORS.darkText, fontWeight: '600', textAlign: 'right', maxWidth: 180 },
  copyBtn: { marginLeft: 8 },
  copyIcon: { fontSize: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingIcon: { fontSize: 20, marginRight: 14 },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.darkText, fontWeight: '500' },
  chevron: { fontSize: 20, color: COLORS.grayText },
  logoutBtn: { margin: 16, backgroundColor: '#FEF2F2', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: 16 },
});

export default ProfileScreen;
