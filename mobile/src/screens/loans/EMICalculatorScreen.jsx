import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { loanService } from '../../api/services/loanService';
import { formatCurrency } from '../../utils/formatters';

const EMICalculatorScreen = ({ navigation }) => {
  const [principal, setPrincipal] = useState('500000');
  const [rate, setRate] = useState('10.5');
  const [tenure, setTenure] = useState('36');
  const [result, setResult] = useState(null);

  const calculate = async (p, r, t) => {
    try {
      const res = await loanService.calculateEMI(parseFloat(p), parseFloat(r), parseInt(t));
      setResult(res.data.data);
    } catch (e) {
      setResult(null);
    }
  };

  useEffect(() => { calculate(principal, rate, tenure); }, []);

  const handleChange = (p, r, t) => {
    calculate(p, r, t);
  };

  const pRatio = result ? Math.round((result.principal / result.totalAmount) * 100) : 50;
  const iRatio = 100 - pRatio;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>EMI Calculator</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Inputs */}
        <Input label="Loan Amount (₹)" value={principal} onChangeText={v => { setPrincipal(v); handleChange(v, rate, tenure); }} keyboardType="decimal-pad" />
        <Input label="Interest Rate (% p.a.)" value={rate} onChangeText={v => { setRate(v); handleChange(principal, v, tenure); }} keyboardType="decimal-pad" />
        <Input label="Tenure (Months)" value={tenure} onChangeText={v => { setTenure(v); handleChange(principal, rate, v); }} keyboardType="number-pad" />

        {/* Quick Tenure Chips */}
        <View style={styles.chipsRow}>
          {[12, 24, 36, 60, 120, 240].map(m => (
            <TouchableOpacity key={m} style={[styles.chip, tenure === String(m) && styles.chipActive]} onPress={() => { setTenure(String(m)); handleChange(principal, rate, String(m)); }}>
              <Text style={[styles.chipText, tenure === String(m) && { color: '#fff' }]}>{m}m</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.emiLabel}>Monthly EMI</Text>
            <Text style={styles.emiAmt}>{formatCurrency(result.emi)}</Text>

            <View style={styles.bar}>
              <View style={[styles.barPrincipal, { flex: pRatio }]} />
              <View style={[styles.barInterest, { flex: iRatio }]} />
            </View>

            <View style={styles.breakdown}>
              <View style={styles.breakItem}>
                <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
                <View>
                  <Text style={styles.breakLabel}>Principal ({pRatio}%)</Text>
                  <Text style={styles.breakVal}>{formatCurrency(result.principal)}</Text>
                </View>
              </View>
              <View style={styles.breakItem}>
                <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
                <View>
                  <Text style={styles.breakLabel}>Interest ({iRatio}%)</Text>
                  <Text style={styles.breakVal}>{formatCurrency(result.totalInterest)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>{formatCurrency(result.totalAmount)}</Text>
            </View>
          </View>
        )}

        <Button title="Apply for this Loan" onPress={() => navigation.navigate('Loans')} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 2, alignItems: 'center' },
  emiLabel: { fontSize: 13, color: COLORS.grayText, marginBottom: 4 },
  emiAmt: { fontSize: 36, fontWeight: '800', color: COLORS.primary, marginBottom: 20 },
  bar: { flexDirection: 'row', height: 12, borderRadius: 6, width: '100%', overflow: 'hidden', marginBottom: 16 },
  barPrincipal: { backgroundColor: COLORS.primary },
  barInterest: { backgroundColor: '#F59E0B' },
  breakdown: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  breakItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  breakLabel: { fontSize: 12, color: COLORS.grayText },
  breakVal: { fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginTop: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 14, fontWeight: '600', color: COLORS.grayText },
  totalVal: { fontSize: 16, fontWeight: '800', color: COLORS.darkText },
});

export default EMICalculatorScreen;
