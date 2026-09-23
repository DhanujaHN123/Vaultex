import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { investmentService } from '../../api/services/investmentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import useStore from '../../store/useStore';

const INV_TYPES = [
  { key: 'mutual_fund', label: 'Mutual Funds', icon: '📊', color: '#3B82F6', desc: 'Diversified portfolio management' },
  { key: 'stocks', label: 'Stocks', icon: '📈', color: '#10B981', desc: 'Direct equity investments' },
  { key: 'fd', label: 'Fixed Deposits', icon: '🏦', color: '#F59E0B', desc: 'Guaranteed returns' },
  { key: 'digital_gold', label: 'Digital Gold', icon: '🥇', color: '#EF4444', desc: 'Invest in 24K digital gold' },
];

const InvestmentsScreen = ({ navigation }) => {
  const { user, updateBalance } = useStore();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [investModal, setInvestModal] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investName, setInvestName] = useState('');
  const [investLoading, setInvestLoading] = useState(false);

  const fetchPortfolio = () => {
    setLoading(true);
    investmentService.getPortfolio().then(r => setPortfolio(r.data.data))
      .catch(() => setError('Failed to load portfolio.')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleInvest = async () => {
    if (!investAmount || parseFloat(investAmount) <= 0) { Alert.alert('Error', 'Enter valid amount'); return; }
    if (parseFloat(investAmount) > (user?.balance || 0)) { Alert.alert('Error', 'Insufficient balance'); return; }
    if (!investName.trim()) { Alert.alert('Error', 'Enter investment name'); return; }
    setInvestLoading(true);
    try {
      const res = await investmentService.invest({ type: investModal.key, name: investName.trim(), amount: parseFloat(investAmount) });
      updateBalance(res.data.data.newBalance);
      Alert.alert('✅ Invested!', `Successfully invested ${formatCurrency(parseFloat(investAmount))} in ${investName}.`);
      setInvestModal(null); setInvestAmount(''); setInvestName('');
      fetchPortfolio();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Investment failed.');
    } finally {
      setInvestLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading portfolio..." />;

  const investments = portfolio?.investments || [];
  const summary = portfolio?.summary || {};
  const filtered = activeTab === 'All' ? investments : investments.filter(i => {
    const map = { 'Mutual Funds': 'mutual_fund', 'Stocks': 'stocks', 'FD': 'fd', 'Gold': 'digital_gold' };
    return i.type === map[activeTab];
  });
  const returnsPositive = (summary.totalReturns || 0) >= 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Investments</Text>
          <View style={{ width: 60 }} />
        </View>
        <ErrorMessage message={error} />

        {/* Portfolio Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Portfolio Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Invested</Text><Text style={styles.summaryVal}>{formatCurrency(summary.totalInvested || 0)}</Text></View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}><Text style={styles.summaryLabel}>Current Value</Text><Text style={styles.summaryVal}>{formatCurrency(summary.totalCurrent || 0)}</Text></View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Returns</Text>
              <Text style={[styles.summaryVal, { color: returnsPositive ? COLORS.success : COLORS.error }]}>
                {returnsPositive ? '+' : ''}{formatCurrency(summary.totalReturns || 0)}
              </Text>
              <Text style={[styles.returnsPercent, { color: returnsPositive ? COLORS.success : COLORS.error }]}>
                ({returnsPositive ? '+' : ''}{summary.returnsPercent || 0}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Invest Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Investing</Text>
          <View style={styles.typeGrid}>
            {INV_TYPES.map(t => (
              <TouchableOpacity key={t.key} style={styles.typeCard} onPress={() => { setInvestModal(t); setInvestName(''); setInvestAmount(''); }}>
                <Text style={{ fontSize: 30, marginBottom: 6 }}>{t.icon}</Text>
                <Text style={styles.typeLabel}>{t.label}</Text>
                <Text style={styles.typeDesc}>{t.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Investments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Investments</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, gap: 8 }}>
            {['All', 'Mutual Funds', 'Stocks', 'FD', 'Gold'].map(tab => (
              <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filtered.length === 0 ? <EmptyState icon="📊" title="No investments yet" subtitle="Start investing to build wealth" /> : (
            filtered.map(inv => {
              const t = INV_TYPES.find(t => t.key === inv.type);
              const ret = inv.currentValue - inv.investedAmount;
              const retPos = ret >= 0;
              return (
                <View key={inv._id} style={styles.invCard}>
                  <View style={styles.invHeader}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>{t?.icon || '📈'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invName}>{inv.name}</Text>
                      <Text style={styles.invType}>{t?.label || inv.type}</Text>
                    </View>
                    <Text style={[styles.invReturn, { color: retPos ? COLORS.success : COLORS.error }]}>
                      {retPos ? '+' : ''}{inv.returns}%
                    </Text>
                  </View>
                  <View style={styles.invDetails}>
                    <View style={styles.invRow}><Text style={styles.invLabel}>Invested</Text><Text style={styles.invVal}>{formatCurrency(inv.investedAmount)}</Text></View>
                    <View style={styles.invRow}><Text style={styles.invLabel}>Current</Text><Text style={[styles.invVal, { color: COLORS.primary }]}>{formatCurrency(inv.currentValue)}</Text></View>
                    <View style={styles.invRow}><Text style={styles.invLabel}>Returns</Text><Text style={[styles.invVal, { color: retPos ? COLORS.success : COLORS.error }]}>{retPos ? '+' : ''}{formatCurrency(ret)}</Text></View>
                  </View>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={!!investModal} transparent animationType="slide" onRequestClose={() => setInvestModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invest in {investModal?.label}</Text>
            <Text style={styles.modalSub}>Balance: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{formatCurrency(user?.balance || 0)}</Text></Text>
            <Input label="Investment Name / Fund Name" value={investName} onChangeText={setInvestName} placeholder={`e.g. ${investModal?.key === 'mutual_fund' ? 'Axis Bluechip Fund' : investModal?.key === 'stocks' ? 'Reliance Industries' : investModal?.key === 'fd' ? 'VaultX 1-Year FD' : '24K Digital Gold'}`} />
            <Input label="Amount (₹)" value={investAmount} onChangeText={setInvestAmount} placeholder="Enter investment amount" keyboardType="decimal-pad" />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setInvestModal(null)} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Invest Now" onPress={handleInvest} loading={investLoading} style={{ flex: 1 }} />
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
  summaryCard: { backgroundColor: COLORS.primary, borderRadius: 20, margin: 16, padding: 20, elevation: 4 },
  summaryTitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 14, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  summaryVal: { fontSize: 14, fontWeight: '800', color: '#fff' },
  returnsPercent: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginBottom: 4 },
  typeDesc: { fontSize: 11, color: COLORS.grayText, lineHeight: 16 },
  tab: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, color: COLORS.grayText, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  invCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, elevation: 1 },
  invHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  invName: { fontSize: 14, fontWeight: '700', color: COLORS.darkText },
  invType: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  invReturn: { fontSize: 16, fontWeight: '800' },
  invDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, gap: 8 },
  invRow: { flexDirection: 'row', justifyContent: 'space-between' },
  invLabel: { fontSize: 12, color: COLORS.grayText },
  invVal: { fontSize: 13, fontWeight: '700', color: COLORS.darkText },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.grayText, marginBottom: 16 },
  modalActions: { flexDirection: 'row', marginTop: 8 },
});

export default InvestmentsScreen;
