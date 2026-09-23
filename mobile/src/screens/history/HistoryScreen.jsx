import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, TextInput, FlatList, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import TransactionItem from '../../components/TransactionItem';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { transactionService } from '../../api/services/transactionService';
import useStore from '../../store/useStore';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const FILTERS = ['All', 'Credit', 'Debit', 'Bills', 'UPI'];

const HistoryScreen = ({ navigation }) => {
  const { user } = useStore();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchTransactions = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    try {
      const params = { page: currentPage, limit: 20 };
      if (filter === 'Credit') params.type = 'credit';
      else if (filter === 'Debit') params.type = 'debit';
      else if (filter === 'Bills') params.category = 'bills';
      else if (filter === 'UPI') params.type = 'upi_payment';
      if (search) params.search = search;
      const res = await transactionService.getTransactions(params);
      const { transactions: txns, pages } = res.data.data;
      if (reset) setTransactions(txns);
      else setTransactions(prev => [...prev, ...txns]);
      setHasMore(currentPage < pages);
      if (!reset) setPage(p => p + 1);
    } catch (e) {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search, page]);

  useEffect(() => { setLoading(true); setPage(1); fetchTransactions(true); }, [filter]);
  useEffect(() => {
    const t = setTimeout(() => { setLoading(true); setPage(1); fetchTransactions(true); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const onRefresh = () => { setRefreshing(true); setPage(1); fetchTransactions(true); };

  if (loading && transactions.length === 0) return <LoadingSpinner fullScreen message="Loading transactions..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search transactions..." placeholderTextColor={COLORS.grayText} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={{ color: COLORS.grayText, fontSize: 18 }}>✕</Text></TouchableOpacity> : null}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ErrorMessage message={error} />

      <FlatList
        data={transactions}
        keyExtractor={i => i._id}
        renderItem={({ item }) => <TouchableOpacity onPress={() => setSelected(item)}><TransactionItem transaction={item} currentUserId={user?._id} /></TouchableOpacity>}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="📭" title="No transactions found" subtitle={search || filter !== 'All' ? 'Try adjusting your search or filter' : 'Your transactions will appear here'} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        onEndReached={() => hasMore && fetchTransactions()}
        onEndReachedThreshold={0.3}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            {selected && (<>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Transaction ID</Text><Text style={styles.modalVal} selectable>{selected.transactionId}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Description</Text><Text style={styles.modalVal}>{selected.description}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Amount</Text><Text style={[styles.modalVal, { color: selected.type === 'credit' ? COLORS.success : COLORS.error, fontSize: 20, fontWeight: '800' }]}>{selected.type === 'credit' ? '+' : '-'}{formatCurrency(selected.amount)}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Type</Text><Text style={styles.modalVal}>{selected.type}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Status</Text><Text style={[styles.modalVal, { color: selected.status === 'success' ? COLORS.success : COLORS.error }]}>{selected.status}</Text></View>
              <View style={styles.modalRow}><Text style={styles.modalLabel}>Date & Time</Text><Text style={styles.modalVal}>{formatDateTime(selected.createdAt)}</Text></View>
              {selected.note && <View style={styles.modalRow}><Text style={styles.modalLabel}>Note</Text><Text style={styles.modalVal}>{selected.note}</Text></View>}
            </>)}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  back: { padding: 4 },
  backText: { fontSize: 22, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.darkText },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.darkText },
  filterScroll: { maxHeight: 52 },
  filterChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 14, color: COLORS.grayText, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 20, textAlign: 'center' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalLabel: { fontSize: 13, color: COLORS.grayText, fontWeight: '500', flex: 1 },
  modalVal: { fontSize: 14, color: COLORS.darkText, fontWeight: '600', flex: 2, textAlign: 'right' },
  closeBtn: { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default HistoryScreen;
