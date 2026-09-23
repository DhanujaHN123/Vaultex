import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PINPad from '../../components/PINPad';
import ErrorMessage from '../../components/ErrorMessage';
import { paymentService } from '../../api/services/paymentService';
import useStore from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';

const PayScreen = ({ navigation }) => {
  const { user, updateBalance } = useStore();
  const [activeTab, setActiveTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [inputError, setInputError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [pinModal, setPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleProceed = () => {
    const identifier = activeTab === 'upi' ? upiId : mobile;
    if (!identifier) { setInputError('Please enter ' + (activeTab === 'upi' ? 'UPI ID' : 'mobile number')); return; }
    if (activeTab === 'mobile' && !/^\d{10}$/.test(mobile)) { setInputError('Enter a valid 10-digit mobile number'); return; }
    if (!amount || parseFloat(amount) <= 0) { setAmountError('Enter a valid amount'); return; }
    if (parseFloat(amount) > (user?.balance || 0)) { setAmountError('Insufficient balance'); return; }
    setInputError(''); setAmountError('');
    setPinModal(true); setPin(''); setPinError('');
  };

  const handlePinChange = async (val) => {
    setPin(val);
    if (val.length === 4) {
      setLoading(true);
      setPinError('');
      try {
        const data = { amount: parseFloat(amount), note };
        if (activeTab === 'upi') data.receiverUPI = upiId;
        else data.receiverMobile = mobile;
        const res = await paymentService.makePayment(data);
        const { senderBalance, transactionId, receiver } = res.data.data;
        updateBalance(senderBalance);
        setPinModal(false);
        setSuccess({ amount: parseFloat(amount), transactionId, receiver });
      } catch (err) {
        setPinError(err.response?.data?.message || 'Payment failed. Please try again.');
        setPin('');
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successScreen}>
          <View style={styles.successIcon}><Text style={{ fontSize: 48 }}>✅</Text></View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successAmount}>{formatCurrency(success.amount)}</Text>
          <Text style={styles.txId}>Ref: {success.transactionId}</Text>
          <Button title="Back to Home" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} style={{ marginTop: 24, width: 260 }} />
          <Button title="Pay Again" variant="outline" onPress={() => { setSuccess(null); setUpiId(''); setMobile(''); setAmount(''); setNote(''); setPin(''); }} style={{ marginTop: 8, width: 260 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Pay</Text>
          <View style={{ width: 60 }} />
        </View>

        <Text style={styles.balance}>Balance: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatCurrency(user?.balance || 0)}</Text></Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[{ key: 'upi', label: 'UPI ID' }, { key: 'mobile', label: 'Mobile No.' }].map(t => (
            <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ErrorMessage message={inputError} />

        {activeTab === 'upi' && <Input label="UPI ID" value={upiId} onChangeText={(v) => { setUpiId(v); setInputError(''); }} placeholder="e.g. 9876543210@vaultx" error={inputError} />}
        {activeTab === 'mobile' && <Input label="Mobile Number" value={mobile} onChangeText={(v) => { setMobile(v); setInputError(''); }} placeholder="10-digit mobile number" keyboardType="phone-pad" error={inputError} />}

        <Input label="Amount (₹)" value={amount} onChangeText={(v) => { setAmount(v); setAmountError(''); }} placeholder="Enter amount" keyboardType="decimal-pad" error={amountError} />
        <Input label="Note (Optional)" value={note} onChangeText={setNote} placeholder="What's this for?" />

        <Button title="Proceed to Pay" onPress={handleProceed} style={{ marginTop: 8 }} />
      </ScrollView>

      <Modal visible={pinModal} transparent animationType="slide" onRequestClose={() => { setPinModal(false); setPin(''); }}>
        <View style={styles.pinOverlay}>
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>Enter PIN to Confirm</Text>
            <Text style={styles.pinAmt}>{formatCurrency(parseFloat(amount) || 0)}</Text>
            <ErrorMessage message={pinError} />
            {loading ? <View style={{ padding: 30, alignItems: 'center' }}><Text style={{ color: COLORS.grayText }}>Processing payment...</Text></View> : (
              <PINPad pin={pin} onPinChange={handlePinChange} maxLength={4} />
            )}
            <TouchableOpacity onPress={() => { setPinModal(false); setPin(''); }} style={{ marginTop: 12 }}>
              <Text style={{ color: COLORS.grayText, textAlign: 'center', fontSize: 14 }}>Cancel</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  balance: { fontSize: 14, color: COLORS.grayText, textAlign: 'right', marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, marginBottom: 20, elevation: 1 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.grayText },
  tabTextActive: { color: '#fff' },
  pinOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pinCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' },
  pinTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  pinAmt: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: COLORS.background },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  successAmount: { fontSize: 34, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  txId: { fontSize: 12, color: COLORS.grayText, marginBottom: 24 },
});

export default PayScreen;
