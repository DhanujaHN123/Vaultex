import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { loanService } from '../../api/services/loanService';
import { formatCurrency, formatDate, getLoanStatusColor } from '../../utils/formatters';

const LoansScreen = ({ navigation }) => {
  const [offersData, setOffersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyModal, setApplyModal] = useState(null);
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTenure, setApplyTenure] = useState('24');
  const [applyLoading, setApplyLoading] = useState(false);
  const [emiPreview, setEmiPreview] = useState(null);

  const fetchLoans = () => {
    setLoading(true);
    loanService.getLoanOffers().then(r => setOffersData(r.data.data))
      .catch(() => setError('Failed to load loans.')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleApply = async () => {
    if (!applyAmount || parseFloat(applyAmount) <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    setApplyLoading(true);
    try {
      await loanService.applyLoan({ type: applyModal.type, amount: parseFloat(applyAmount), tenure: parseInt(applyTenure) });
      Alert.alert('✅ Application Submitted', 'Your loan application is under review. We will contact you within 24-48 hours.');
      setApplyModal(null); setApplyAmount(''); setEmiPreview(null);
      fetchLoans();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Loan application failed.');
    } finally {
      setApplyLoading(false);
    }
  };

  const calculatePreview = async (amt, tenure, rate) => {
    if (!amt || isNaN(parseFloat(amt)) || parseFloat(amt) <= 0) { setEmiPreview(null); return; }
    try {
      const res = await loanService.calculateEMI(parseFloat(amt), rate, parseInt(tenure));
      setEmiPreview(res.data.data);
    } catch (e) {
      setEmiPreview(null);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading loans..." />;

  const offers = offersData?.offers || [];
  const myLoans = offersData?.myLoans || [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Loans</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EMICalculator')}><Text style={styles.emiCalcBtn}>🧮 EMI Calc</Text></TouchableOpacity>
        </View>

        <ErrorMessage message={error} />

        {/* My Loans */}
        {myLoans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Loans ({myLoans.length})</Text>
            {myLoans.map(loan => (
              <View key={loan._id} style={styles.loanCard}>
                <View style={styles.loanHeader}>
                  <View>
                    <Text style={styles.loanType}>{loan.type?.toUpperCase()} LOAN</Text>
                    <Text style={styles.loanAmt}>{formatCurrency(loan.amount)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getLoanStatusColor(loan.status, COLORS) + '20' }]}>
                    <Text style={[styles.statusText, { color: getLoanStatusColor(loan.status, COLORS) }]}>{loan.status}</Text>
                  </View>
                </View>
                <View style={styles.loanDetails}>
                  <View style={styles.loanRow}><Text style={styles.loanLabel}>Interest Rate</Text><Text style={styles.loanVal}>{loan.interestRate}% p.a.</Text></View>
                  <View style={styles.loanRow}><Text style={styles.loanLabel}>Monthly EMI</Text><Text style={[styles.loanVal, { color: COLORS.primary }]}>{formatCurrency(loan.emi)}</Text></View>
                  <View style={styles.loanRow}><Text style={styles.loanLabel}>Tenure</Text><Text style={styles.loanVal}>{loan.tenure} months</Text></View>
                  {loan.nextEmiDate && <View style={styles.loanRow}><Text style={styles.loanLabel}>Next EMI Due</Text><Text style={styles.loanVal}>{formatDate(loan.nextEmiDate)}</Text></View>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Loan Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Loan Offers</Text>
          {offers.map(offer => (
            <View key={offer.type} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View>
                  <Text style={styles.offerName}>{offer.name}</Text>
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                </View>
                <View style={styles.rateBadge}>
                  <Text style={styles.rateText}>{offer.interestRate}%</Text>
                  <Text style={styles.rateSub}>p.a.</Text>
                </View>
              </View>
              <View style={styles.offerStats}>
                <View><Text style={styles.statLabel}>Max Amount</Text><Text style={styles.statVal}>{formatCurrency(offer.maxAmount)}</Text></View>
                <View><Text style={styles.statLabel}>Max Tenure</Text><Text style={styles.statVal}>{offer.maxTenure} months</Text></View>
              </View>
              <Button title="Apply Now" onPress={() => { setApplyModal(offer); setApplyAmount(String(Math.min(100000, offer.maxAmount))); calculatePreview(Math.min(100000, offer.maxAmount), 24, offer.interestRate); }} style={{ marginVertical: 4 }} />
            </View>
          ))}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={!!applyModal} transparent animationType="slide" onRequestClose={() => setApplyModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apply for {applyModal?.name}</Text>
            <Text style={styles.modalSub}>Interest: {applyModal?.interestRate}% p.a. • Max: {formatCurrency(applyModal?.maxAmount || 0)}</Text>
            <Input
              label="Loan Amount (₹)"
              value={applyAmount}
              onChangeText={v => { setApplyAmount(v); calculatePreview(v, applyTenure, applyModal?.interestRate); }}
              placeholder="Enter loan amount"
              keyboardType="decimal-pad"
            />
            <Text style={styles.tenureLabel}>Tenure (Months): {applyTenure}m</Text>
            <View style={styles.tenureRow}>
              {[12, 24, 36, 48, 60].filter(m => m <= (applyModal?.maxTenure || 60)).map(m => (
                <TouchableOpacity key={m} style={[styles.tenureChip, applyTenure === String(m) && styles.tenureActive]} onPress={() => { setApplyTenure(String(m)); calculatePreview(applyAmount, m, applyModal?.interestRate); }}>
                  <Text style={[styles.tenureText, applyTenure === String(m) && { color: '#fff' }]}>{m}m</Text>
                </TouchableOpacity>
              ))}
            </View>
            {emiPreview && (
              <View style={styles.emiBox}>
                <Text style={styles.emiLabel}>Estimated Monthly EMI</Text>
                <Text style={styles.emiVal}>{formatCurrency(emiPreview.emi)}</Text>
                <Text style={styles.emiTotal}>Total Payable: {formatCurrency(emiPreview.totalAmount)} (Interest: {formatCurrency(emiPreview.totalInterest)})</Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setApplyModal(null)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Submit Application" onPress={handleApply} loading={applyLoading} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  emiCalcBtn: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  loanCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  loanType: { fontSize: 11, color: COLORS.grayText, fontWeight: '700', letterSpacing: 1 },
  loanAmt: { fontSize: 22, fontWeight: '800', color: COLORS.darkText, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  loanDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 8 },
  loanRow: { flexDirection: 'row', justifyContent: 'space-between' },
  loanLabel: { fontSize: 13, color: COLORS.grayText },
  loanVal: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
  offerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  offerName: { fontSize: 16, fontWeight: '700', color: COLORS.darkText },
  offerDesc: { fontSize: 12, color: COLORS.grayText, marginTop: 2, maxWidth: 220 },
  rateBadge: { backgroundColor: '#E8F5F3', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  rateText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  rateSub: { color: COLORS.primary, fontSize: 10 },
  offerStats: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  statLabel: { fontSize: 11, color: COLORS.grayText },
  statVal: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.grayText, marginBottom: 16 },
  tenureLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkText, marginBottom: 8 },
  tenureRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tenureChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  tenureActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tenureText: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
  emiBox: { backgroundColor: '#F0FAF9', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.primary + '30' },
  emiLabel: { fontSize: 12, color: COLORS.grayText },
  emiVal: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginVertical: 4 },
  emiTotal: { fontSize: 11, color: COLORS.grayText },
  modalActions: { flexDirection: 'row' },
});

export default LoansScreen;
