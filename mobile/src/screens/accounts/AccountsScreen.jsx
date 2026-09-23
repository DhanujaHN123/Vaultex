import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { accountService } from '../../api/services/accountService';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';

const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    accountService.getAccounts().then(r => setAccounts(r.data.data))
      .catch(() => setError('Failed to load accounts.')).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen message="Loading accounts..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>My Accounts</Text>
          <View style={{ width: 60 }} />
        </View>
        <ErrorMessage message={error} />
        {accounts.length === 0 ? <EmptyState icon="🏦" title="No accounts" subtitle="Your linked accounts will appear here" /> : (
          <View style={styles.list}>
            {accounts.map(acc => (
              <View key={acc._id} style={styles.accCard}>
                <View style={styles.accHeader}>
                  <View style={styles.accIcon}><Text style={{ fontSize: 24 }}>🏦</Text></View>
                  <View style={styles.accInfo}>
                    <Text style={styles.accBank}>{acc.bankName || 'VaultX Bank'}</Text>
                    <Text style={styles.accType}>{acc.type?.charAt(0).toUpperCase() + acc.type?.slice(1)} Account</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: acc.status === 'active' ? '#D1FAE5' : '#FEE2E2' }]}>
                    <Text style={[styles.statusText, { color: acc.status === 'active' ? COLORS.success : COLORS.error }]}>{acc.status}</Text>
                  </View>
                </View>
                <View style={styles.accDetails}>
                  <View style={styles.detRow}><Text style={styles.detLabel}>Account No.</Text><Text style={styles.detVal}>{maskAccountNumber(acc.accountNumber)}</Text></View>
                  <View style={styles.detRow}><Text style={styles.detLabel}>IFSC Code</Text><Text style={styles.detVal}>{acc.ifsc}</Text></View>
                  <View style={styles.detRow}><Text style={styles.detLabel}>Balance</Text><Text style={[styles.detVal, { color: COLORS.primary, fontSize: 16, fontWeight: '800' }]}>{formatCurrency(acc.balance)}</Text></View>
                  {acc.isPrimary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>⭐ Primary Account</Text></View>}
                </View>
                <TouchableOpacity style={styles.stmtBtn} onPress={() => navigation.navigate('History')}>
                  <Text style={styles.stmtBtnText}>View Statement →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={{ marginHorizontal: 16, marginTop: 8 }}>
          <Button title="🔗 Link Another Account" variant="outline" onPress={() => Alert.alert('Link Account', 'Enter the mobile number of the VaultX account you want to link.', [{ text: 'OK' }])} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  backText: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  list: { paddingHorizontal: 16 },
  accCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  accHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 12 },
  accIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  accInfo: { flex: 1 },
  accBank: { fontSize: 16, fontWeight: '700', color: COLORS.darkText },
  accType: { fontSize: 13, color: COLORS.grayText, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  accDetails: { gap: 10 },
  detRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detLabel: { fontSize: 13, color: COLORS.grayText },
  detVal: { fontSize: 14, fontWeight: '600', color: COLORS.darkText },
  primaryBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginTop: 4 },
  primaryText: { color: '#B45309', fontWeight: '700', fontSize: 12 },
  stmtBtn: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  stmtBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});

export default AccountsScreen;
