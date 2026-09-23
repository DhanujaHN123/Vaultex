import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import TransactionItem from '../../components/TransactionItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { userService } from '../../api/services/userService';
import { transactionService } from '../../api/services/transactionService';
import useStore from '../../store/useStore';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters';

const QuickAction = ({ icon, label, onPress, color }) => (
  <TouchableOpacity style={styles.qa} onPress={onPress}>
    <View style={[styles.qaIcon, { backgroundColor: color || COLORS.primary }]}><Text style={styles.qaEmoji}>{icon}</Text></View>
    <Text style={styles.qaLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { user, logout, setUser, setAccount, updateBalance } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, txRes] = await Promise.all([
        userService.getProfile(),
        transactionService.getTransactions({ limit: 5 }),
      ]);
      const { user: u, account } = profileRes.data.data;
      setUser(u);
      setAccount(account);
      if (account) updateBalance(account.balance);
      setTransactions(txRes.data.data.transactions || []);
    } catch (e) {
      console.log('Dashboard fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.headerBrand}>VaultX</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.profileInitial}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBalance(v => !v)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showBalance ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmt}>{showBalance ? formatCurrency(user?.balance || 0) : '₹ ••••••'}</Text>
          <View style={styles.acctRow}>
            <Text style={styles.acctNum}>{maskAccountNumber(user?.accountNumber)}</Text>
            <View style={styles.secureBadge}><Text style={styles.secureBadgeText}>🔒 Secure</Text></View>
          </View>
        </View>

        {/* Quick Actions Row 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.qaRow}>
            <QuickAction icon="⬆️" label="Send" onPress={() => navigation.navigate('SendMoney')} color="#087F68" />
            <QuickAction icon="⬇️" label="Receive" onPress={() => navigation.navigate('ReceiveMoney')} color="#0E9F88" />
            <QuickAction icon="📲" label="Pay" onPress={() => navigation.navigate('Pay')} color="#065a4a" />
            <QuickAction icon="🧾" label="Bills" onPress={() => navigation.navigate('Bills')} color="#F59E0B" />
          </View>
          <View style={styles.qaRow}>
            <QuickAction icon="🛡️" label="Insurance" onPress={() => navigation.navigate('Insurance')} color="#8B5CF6" />
            <QuickAction icon="💳" label="Cards" onPress={() => navigation.navigate('Cards')} color="#EC4899" />
            <QuickAction icon="📈" label="Invest" onPress={() => navigation.navigate('Investments')} color="#06B6D4" />
            <QuickAction icon="🏦" label="Loans" onPress={() => navigation.navigate('Loans')} color="#EF4444" />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}><Text style={styles.seeAll}>See All →</Text></TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <EmptyState icon="💸" title="No transactions yet" subtitle="Start sending or receiving money!" />
          ) : (
            transactions.map(tx => <TransactionItem key={tx._id} transaction={tx} currentUserId={user?._id} />)
          )}
        </View>

        {/* Security Status */}
        <View style={styles.securityCard}>
          <Text style={styles.secIcon}>🔐</Text>
          <View style={styles.secInfo}>
            <Text style={styles.secTitle}>Account Secured</Text>
            <Text style={styles.secSub}>PIN authentication active • Encrypted transactions</Text>
          </View>
          <View style={styles.secBadge}><Text style={styles.secBadgeText}>Active</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, borderRadius: 8, marginRight: 8 },
  headerBrand: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  profileInitial: { color: '#fff', fontSize: 18, fontWeight: '700' },
  balanceCard: { backgroundColor: COLORS.primary, margin: 16, borderRadius: 20, padding: 22, elevation: 6, shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  greeting: { fontSize: 15, color: '#fff', fontWeight: '600', marginTop: 2 },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 22 },
  balanceAmt: { fontSize: 34, fontWeight: '800', color: '#fff', marginBottom: 14 },
  acctRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  acctNum: { fontSize: 14, color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
  secureBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  secureBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  qaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  qa: { alignItems: 'center', flex: 1 },
  qaIcon: { width: 54, height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center', marginBottom: 6, elevation: 2 },
  qaEmoji: { fontSize: 22 },
  qaLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkText },
  securityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, marginBottom: 24 },
  secIcon: { fontSize: 28, marginRight: 14 },
  secInfo: { flex: 1 },
  secTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkText },
  secSub: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  secBadge: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  secBadgeText: { color: COLORS.success, fontWeight: '700', fontSize: 12 },
});

export default DashboardScreen;
