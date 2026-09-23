import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { formatCurrency, formatDateTime, getTransactionSign, getTransactionColor } from '../utils/formatters';

const TransactionItem = ({ transaction: tx, currentUserId }) => {
  const isCredit = tx.type === 'credit' || (tx.receiverId && (tx.receiverId._id === currentUserId || tx.receiverId === currentUserId));
  const isDebit = !isCredit;
  const sign = isCredit ? '+' : '-';
  const amtColor = isCredit ? COLORS.success : COLORS.error;
  const icons = { credit: '⬇️', debit: '⬆️', transfer: '💸', bill_payment: '🧾', upi_payment: '📲' };
  const icon = icons[tx.type] || '💳';

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{tx.description || 'Transaction'}</Text>
        <Text style={styles.date}>{formatDateTime(tx.createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amtColor }]}>{sign}{formatCurrency(tx.amount)}</Text>
        <Text style={[styles.status, { color: tx.status === 'success' ? COLORS.success : COLORS.error }]}>
          {tx.status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 20 },
  info: { flex: 1, marginRight: 8 },
  desc: { fontSize: 14, fontWeight: '600', color: COLORS.darkText },
  date: { fontSize: 12, color: COLORS.grayText, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  status: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
});

export default TransactionItem;
