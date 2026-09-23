import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Button from '../../components/Button';
import useStore from '../../store/useStore';
import { formatMobile } from '../../utils/formatters';
import * as Clipboard from 'expo-clipboard';

const ReceiveMoneyScreen = ({ navigation }) => {
  const { user } = useStore();
  const upiId = `${user?.mobile}@vaultx`;

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
  };

  const InfoRow = ({ label, value, onCopy }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        {onCopy && <TouchableOpacity onPress={onCopy} style={styles.copyBtn}><Text>📋</Text></TouchableOpacity>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Receive Money</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.subtitle}>Share your payment details to receive money instantly</Text>

        {/* QR Code Placeholder */}
        <View style={styles.qrBox}>
          <View style={styles.qrInner}>
            <Text style={styles.qrLogo}>💎</Text>
            <Text style={styles.qrUPI}>{upiId}</Text>
            <Text style={styles.qrHint}>Scan to pay via UPI</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Payment Details</Text>
          <InfoRow label="Name" value={user?.name || 'N/A'} />
          <InfoRow label="Mobile" value={formatMobile(user?.mobile)} onCopy={() => copyToClipboard(user?.mobile || '', 'Mobile number')} />
          <InfoRow label="Account No." value={user?.accountNumber || 'N/A'} onCopy={() => copyToClipboard(user?.accountNumber || '', 'Account number')} />
          <InfoRow label="UPI ID" value={upiId} onCopy={() => copyToClipboard(upiId, 'UPI ID')} />
          <InfoRow label="Bank" value="VaultX Bank" />
          <InfoRow label="IFSC" value="VLTX0001234" onCopy={() => copyToClipboard('VLTX0001234', 'IFSC code')} />
        </View>

        <Button title="📋 Copy UPI ID" onPress={() => copyToClipboard(upiId, 'UPI ID')} variant="outline" style={{ marginHorizontal: 0, marginTop: 8 }} />
        <Button title="📤 Share Payment Details" onPress={() => Alert.alert('Share', `VaultX Payment Details\nName: ${user?.name}\nUPI ID: ${upiId}\nAccount: ${user?.accountNumber}\nIFSC: VLTX0001234`)} style={{ marginHorizontal: 0 }} />

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>How to receive money</Text>
          {['Share your UPI ID or account details with the sender', 'The sender initiates a transfer on their banking app', 'Money is credited to your VaultX account instantly', 'You\'ll see the transaction in your History'].map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  subtitle: { fontSize: 14, color: COLORS.grayText, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  qrBox: { alignItems: 'center', marginBottom: 20 },
  qrInner: { width: 200, height: 200, borderRadius: 16, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.primary, elevation: 4 },
  qrLogo: { fontSize: 48, marginBottom: 8 },
  qrUPI: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textAlign: 'center', paddingHorizontal: 8 },
  qrHint: { fontSize: 11, color: COLORS.grayText, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { fontSize: 13, color: COLORS.grayText },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, fontWeight: '600', color: COLORS.darkText, textAlign: 'right', maxWidth: 180 },
  copyBtn: { marginLeft: 8 },
  stepsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 8, elevation: 1 },
  stepsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { flex: 1, fontSize: 14, color: COLORS.grayText, lineHeight: 20 },
});

export default ReceiveMoneyScreen;
