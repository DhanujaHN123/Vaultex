import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PINPad from '../../components/PINPad';
import ErrorMessage from '../../components/ErrorMessage';
import { transactionService } from '../../api/services/transactionService';
import useStore from '../../store/useStore';
import { formatCurrency, formatMobile } from '../../utils/formatters';

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

const SendMoneyScreen = ({ navigation }) => {
  const { user, updateBalance } = useStore();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [findLoading, setFindLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [amountError, setAmountError] = useState('');
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  const findReceiver = async () => {
    if (!/^\d{10}$/.test(mobile)) { setMobileError('Enter a valid 10-digit mobile number'); return; }
    if (mobile === user?.mobile) { setMobileError('You cannot send money to yourself'); return; }
    setFindLoading(true);
    setMobileError('');
    try {
      // Validate by attempting to get receiver info via send (backend validates)
      setReceiver({ mobile, name: 'VaultX User' });
      setStep(2);
    } catch (e) {
      setMobileError('User not found on VaultX');
    } finally {
      setFindLoading(false);
    }
  };

  const handleProceed = () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setAmountError('Enter a valid amount'); return; }
    if (amt > (user?.balance || 0)) { setAmountError('Insufficient balance'); return; }
    if (amt > 100000) { setAmountError('Maximum ₹1,00,000 per transaction'); return; }
    setAmountError('');
    setPinModal(true);
    setPin('');
    setPinError('');
  };

  const handlePinChange = async (val) => {
    setPin(val);
    setPinError('');
    if (val.length === 4) await handleSend(val);
  };

  const handleSend = async (pinVal) => {
    setSendLoading(true);
    setPinError('');
    try {
      const res = await transactionService.sendMoney(mobile, parseFloat(amount), note, pinVal);
      const { senderBalance, receiver: recv, transactionId } = res.data.data;
      updateBalance(senderBalance);
      setPinModal(false);
      setSuccess({ amount: parseFloat(amount), receiver: recv, transactionId });
    } catch (err) {
      setPinError(err.response?.data?.message || 'Transaction failed. Please try again.');
      setPin('');
    } finally {
      setSendLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}><Text style={{ fontSize: 48 }}>✅</Text></View>
          <Text style={styles.successTitle}>Money Sent!</Text>
          <Text style={styles.successAmount}>{formatCurrency(success.amount)}</Text>
          <Text style={styles.successTo}>sent to <Text style={{ fontWeight: '700' }}>{success.receiver?.name || mobile}</Text></Text>
          <Text style={styles.txId}>Ref: {success.transactionId}</Text>
          <Button title="Back to Home" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} style={{ marginTop: 24 }} />
          <Button title="Send Again" variant="outline" onPress={() => { setStep(1); setMobile(''); setAmount(''); setNote(''); setReceiver(null); setSuccess(null); }} style={{ marginTop: 8 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}><Text style={styles.backText}>← {step > 1 ? 'Back' : ''}</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Step indicators */}
        <View style={styles.steps}>
          {['Recipient', 'Amount', 'Confirm'].map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={[styles.stepNum, step > i + 1 && styles.stepDone, step === i + 1 && styles.stepCurrent]}>
                <Text style={styles.stepNumText}>{step > i + 1 ? '✓' : i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{s}</Text>
            </View>
          ))}
        </View>

        <ErrorMessage message={apiError} />

        {step === 1 && (
          <View>
            <Input label="Receiver Mobile Number" value={mobile} onChangeText={(t) => { setMobile(t); setMobileError(''); }} placeholder="Enter 10-digit mobile number" keyboardType="phone-pad" error={mobileError} />
            <Text style={styles.hint}>💡 Enter the VaultX registered mobile number of the recipient</Text>
            <Button title="Find User" onPress={findReceiver} loading={findLoading} style={{ marginTop: 12 }} />
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.receiverCard}>
              <View style={styles.receiverAvatar}><Text style={styles.receiverAvatarText}>{(receiver?.name || 'U')[0].toUpperCase()}</Text></View>
              <View>
                <Text style={styles.receiverName}>{receiver?.name || 'VaultX User'}</Text>
                <Text style={styles.receiverMobile}>{formatMobile(mobile)}</Text>
              </View>
            </View>

            <Text style={styles.balanceHint}>Available: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatCurrency(user?.balance || 0)}</Text></Text>

            <Input label="Amount (₹)" value={amount} onChangeText={(t) => { setAmount(t); setAmountError(''); }} placeholder="Enter amount" keyboardType="decimal-pad" error={amountError} />

            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map(a => (
                <TouchableOpacity key={a} style={styles.qaChip} onPress={() => setAmount(String(a))}>
                  <Text style={styles.qaChipText}>₹{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Note (Optional)" value={note} onChangeText={setNote} placeholder="What's this for?" />
            <Button title="Proceed" onPress={handleProceed} style={{ marginTop: 8 }} />
          </View>
        )}
      </ScrollView>

      {/* PIN Confirmation Modal */}
      <Modal visible={pinModal} transparent animationType="slide" onRequestClose={() => { setPinModal(false); setPin(''); }}>
        <View style={styles.pinOverlay}>
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>Confirm with PIN</Text>
            <View style={styles.confirmSummary}>
              <Text style={styles.confirmAmt}>{formatCurrency(parseFloat(amount) || 0)}</Text>
              <Text style={styles.confirmTo}>to {mobile}</Text>
            </View>
            <ErrorMessage message={pinError} />
            {sendLoading ? <View style={{ padding: 30, alignItems: 'center' }}><Text style={{ color: COLORS.grayText }}>Processing...</Text></View> : (
              <PINPad pin={pin} onPinChange={handlePinChange} maxLength={4} />
            )}
            <TouchableOpacity onPress={() => { setPinModal(false); setPin(''); setPinError(''); }} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: COLORS.grayText, fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  steps: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 12 },
  stepItem: { alignItems: 'center' },
  stepNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCurrent: { backgroundColor: COLORS.primary },
  stepDone: { backgroundColor: COLORS.success },
  stepNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepLabel: { fontSize: 11, color: COLORS.grayText },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  hint: { fontSize: 13, color: COLORS.grayText, marginBottom: 8, textAlign: 'center' },
  balanceHint: { fontSize: 14, color: COLORS.grayText, marginBottom: 14, textAlign: 'right' },
  receiverCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  receiverAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  receiverAvatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  receiverName: { fontSize: 16, fontWeight: '700', color: COLORS.darkText },
  receiverMobile: { fontSize: 13, color: COLORS.grayText, marginTop: 2 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  qaChip: { backgroundColor: '#E8F5F3', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary },
  qaChipText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  pinOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pinCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' },
  pinTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 16 },
  confirmSummary: { alignItems: 'center', marginBottom: 16, backgroundColor: COLORS.background, borderRadius: 12, padding: 16, width: '100%' },
  confirmAmt: { fontSize: 32, fontWeight: '800', color: COLORS.darkText },
  confirmTo: { fontSize: 15, color: COLORS.grayText, marginTop: 4 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: COLORS.background },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  successAmount: { fontSize: 36, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  successTo: { fontSize: 16, color: COLORS.grayText, marginBottom: 8 },
  txId: { fontSize: 12, color: COLORS.grayText, marginBottom: 24 },
});

export default SendMoneyScreen;
