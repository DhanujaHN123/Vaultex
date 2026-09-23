import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { billService } from '../../api/services/billService';
import useStore from '../../store/useStore';
import { formatCurrency, formatDate, getCategoryIcon } from '../../utils/formatters';

const CATEGORIES = [
  { key: 'electricity', label: 'Electricity', icon: '⚡', color: '#F59E0B' },
  { key: 'mobile', label: 'Mobile', icon: '📱', color: '#3B82F6' },
  { key: 'internet', label: 'Internet', icon: '🌐', color: '#8B5CF6' },
  { key: 'dth', label: 'DTH', icon: '📺', color: '#EC4899' },
  { key: 'water', label: 'Water', icon: '💧', color: '#06B6D4' },
  { key: 'rent', label: 'Rent', icon: '🏠', color: '#EF4444' },
];

const BillsScreen = ({ navigation }) => {
  const { user, updateBalance } = useStore();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: '', provider: '', consumerNumber: '', amount: '', dueDate: '' });
  const [formErrors, setFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => { fetchBills(); }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await billService.getBills();
      setBills(res.data.data);
    } catch (e) {
      setError('Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (bill) => {
    Alert.alert('Pay Bill', `Pay ${formatCurrency(bill.amount)} for ${bill.provider}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay Now', onPress: async () => {
        setPayingId(bill._id);
        try {
          const res = await billService.payBill(bill._id);
          updateBalance(res.data.data.newBalance);
          fetchBills();
          Alert.alert('✅ Success', 'Bill paid successfully!');
        } catch (e) {
          Alert.alert('❌ Failed', e.response?.data?.message || 'Payment failed.');
        } finally {
          setPayingId(null);
        }
      }}
    ]);
  };

  const handleAddBill = async () => {
    const errs = {};
    if (!form.category) errs.category = 'Select category';
    if (!form.provider.trim()) errs.provider = 'Provider is required';
    if (!form.consumerNumber.trim()) errs.consumerNumber = 'Consumer number required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter valid amount';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setAddLoading(true);
    try {
      await billService.addBill({ ...form, amount: parseFloat(form.amount) });
      setShowAdd(false);
      setForm({ category: '', provider: '', consumerNumber: '', amount: '', dueDate: '' });
      fetchBills();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add bill.');
    } finally {
      setAddLoading(false);
    }
  };

  const pending = bills.filter(b => b.status !== 'paid');
  const paid = bills.filter(b => b.status === 'paid');

  if (loading) return <LoadingSpinner fullScreen message="Loading bills..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Bills & Payments</Text>
          <TouchableOpacity onPress={() => setShowAdd(true)}><Text style={styles.addBtn}>+ Add</Text></TouchableOpacity>
        </View>

        <ErrorMessage message={error} />

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Categories</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat.key} style={styles.catCard} onPress={() => { setForm(f => ({ ...f, category: cat.key })); setShowAdd(true); }}>
                <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}><Text style={styles.catEmoji}>{cat.icon}</Text></View>
                <Text style={styles.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Bills */}
        {pending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Bills</Text>
            {pending.map(bill => {
              const cat = CATEGORIES.find(c => c.key === bill.category);
              return (
                <View key={bill._id} style={[styles.billCard, bill.status === 'overdue' && styles.overdueCard]}>
                  <View style={[styles.billIcon, { backgroundColor: (cat?.color || COLORS.primary) + '20' }]}>
                    <Text style={{ fontSize: 22 }}>{cat?.icon || '🧾'}</Text>
                  </View>
                  <View style={styles.billInfo}>
                    <Text style={styles.billProvider}>{bill.provider}</Text>
                    <Text style={styles.billMeta}>{bill.category} • {bill.consumerNumber}</Text>
                    {bill.dueDate && <Text style={[styles.billDue, bill.status === 'overdue' && { color: COLORS.error }]}>Due: {formatDate(bill.dueDate)}</Text>}
                  </View>
                  <View style={styles.billRight}>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                    <TouchableOpacity style={styles.payBtn} onPress={() => handlePayBill(bill)} disabled={payingId === bill._id}>
                      <Text style={styles.payBtnText}>{payingId === bill._id ? '...' : 'Pay'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Paid Bills */}
        {paid.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Payments</Text>
            {paid.slice(0, 5).map(bill => (
              <View key={bill._id} style={styles.paidCard}>
                <Text style={styles.paidIcon}>{CATEGORIES.find(c => c.key === bill.category)?.icon || '🧾'}</Text>
                <View style={styles.billInfo}>
                  <Text style={styles.billProvider}>{bill.provider}</Text>
                  <Text style={styles.billMeta}>{formatDate(bill.paidAt)}</Text>
                </View>
                <View style={styles.paidRight}>
                  <Text style={styles.paidAmount}>{formatCurrency(bill.amount)}</Text>
                  <View style={styles.paidBadge}><Text style={styles.paidBadgeText}>Paid</Text></View>
                </View>
              </View>
            ))}
          </View>
        )}

        {bills.length === 0 && <EmptyState icon="🧾" title="No bills yet" subtitle="Add a bill to track and pay it" action={() => setShowAdd(true)} actionLabel="Add Bill" />}

        {/* Add Bill Modal */}
        {showAdd && (
          <View style={styles.addModal}>
            <View style={styles.addCard}>
              <Text style={styles.addTitle}>Add New Bill</Text>
              <Text style={styles.addLabel}>Category</Text>
              <View style={styles.catRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat.key} style={[styles.miniCat, form.category === cat.key && styles.miniCatActive]} onPress={() => setForm(f => ({ ...f, category: cat.key }))}>
                    <Text>{cat.icon}</Text>
                    <Text style={[styles.miniCatText, form.category === cat.key && { color: '#fff' }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formErrors.category && <Text style={styles.err}>{formErrors.category}</Text>}
              <Input label="Provider Name" value={form.provider} onChangeText={v => setForm(f => ({ ...f, provider: v }))} placeholder="e.g. BESCOM, Airtel" error={formErrors.provider} />
              <Input label="Consumer/Account Number" value={form.consumerNumber} onChangeText={v => setForm(f => ({ ...f, consumerNumber: v }))} placeholder="Your consumer number" error={formErrors.consumerNumber} />
              <Input label="Amount (₹)" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} placeholder="Bill amount" keyboardType="decimal-pad" error={formErrors.amount} />
              <View style={styles.addActions}>
                <Button title="Cancel" variant="outline" onPress={() => { setShowAdd(false); setFormErrors({}); }} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Add Bill" onPress={handleAddBill} loading={addLoading} style={{ flex: 1 }} />
              </View>
            </View>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  addBtn: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard: { width: '30%', backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 1 },
  catIcon: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkText, textAlign: 'center' },
  billCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  overdueCard: { borderWidth: 1, borderColor: COLORS.error + '60' },
  billIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  billInfo: { flex: 1 },
  billProvider: { fontSize: 14, fontWeight: '700', color: COLORS.darkText },
  billMeta: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  billDue: { fontSize: 12, color: COLORS.warning, marginTop: 2 },
  billRight: { alignItems: 'flex-end' },
  billAmount: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 6 },
  payBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  paidCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, opacity: 0.8 },
  paidIcon: { fontSize: 24, marginRight: 12 },
  paidRight: { alignItems: 'flex-end' },
  paidAmount: { fontSize: 14, fontWeight: '700', color: COLORS.grayText },
  paidBadge: { backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  paidBadgeText: { color: COLORS.success, fontSize: 11, fontWeight: '700' },
  addModal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  addCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '90%' },
  addTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 16 },
  addLabel: { fontSize: 14, fontWeight: '600', color: COLORS.darkText, marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  miniCat: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  miniCatActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  miniCatText: { fontSize: 12, fontWeight: '600', color: COLORS.darkText },
  err: { color: COLORS.error, fontSize: 12, marginBottom: 8 },
  addActions: { flexDirection: 'row', marginTop: 8 },
});

export default BillsScreen;
