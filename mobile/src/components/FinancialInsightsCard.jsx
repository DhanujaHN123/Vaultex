import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
import { formatCurrency, getTransactionSign, getCategoryIcon } from '../utils/formatters';

const FinancialInsightsCard = ({ transactions = [], currentUserId }) => {
  // 1. Filter out only spending/outgoing transactions
  const spendingTxns = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.status === 'failed') return false;
      return getTransactionSign(tx, currentUserId) === '-';
    });
  }, [transactions, currentUserId]);

  // 2. Compute total spending
  const totalSpending = useMemo(() => {
    return spendingTxns.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  }, [spendingTxns]);

  // 3. Group spending by category
  const categories = useMemo(() => {
    const map = {};
    spendingTxns.forEach(tx => {
      let cat = tx.category || 'other';
      if (cat === 'transfer' && tx.type === 'bill_payment') cat = 'bills';
      if (cat === 'transfer' && tx.type === 'upi_payment') cat = 'transfer';
      const normCat = cat.toLowerCase();
      map[normCat] = (map[normCat] || 0) + (Number(tx.amount) || 0);
    });

    return Object.entries(map)
      .map(([key, amount]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        amount,
        percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        icon: getCategoryIcon(key),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [spendingTxns, totalSpending]);

  // 4. Determine highest spending category
  const highestCategory = categories.length > 0 ? categories[0] : null;

  // 5. Generate rule-based spending insights
  const insights = useMemo(() => {
    if (spendingTxns.length === 0) {
      return [
        'No spending recorded yet. Complete transfers or pay bills to generate automated insights.',
      ];
    }

    const list = [
      `Your total spending across recorded transactions is ${formatCurrency(totalSpending)}.`,
    ];

    if (highestCategory) {
      list.push(
        `Your highest spending category is ${highestCategory.label}, accounting for ${highestCategory.percentage}% of your total spending.`
      );

      // Contextual recommendation based on category type
      if (highestCategory.key === 'bills') {
        list.push(
          'Utility and bill payments make up the majority of your expenses. Keep due dates tracked to avoid late fees.'
        );
      } else if (highestCategory.key === 'shopping') {
        list.push(
          'Retail purchases are your main outflow. Setting a monthly shopping threshold could optimize your savings.'
        );
      } else if (highestCategory.key === 'food') {
        list.push(
          'Dining and groceries are your primary expense driver. Meal planning can help control monthly food spend.'
        );
      } else if (highestCategory.key === 'transfer') {
        list.push(
          'Direct peer transfers represent your largest outflow. Ensure personal transfers are planned in your monthly budget.'
        );
      } else {
        list.push(
          `You have active expenses across ${categories.length} categories. Monitoring ${highestCategory.label} will have the largest impact on your budget.`
        );
      }
    }

    return list;
  }, [spendingTxns, totalSpending, highestCategory, categories]);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.robotEmoji}>🤖</Text>
          <View>
            <Text style={styles.title}>VaultX AI Financial Insights</Text>
            <Text style={styles.subtitle}>Rule-Based Spending Intelligence</Text>
          </View>
        </View>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI Analysis</Text>
        </View>
      </View>

      {/* KPI Highlights */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>Total Spending</Text>
          <Text style={styles.kpiValue}>{formatCurrency(totalSpending)}</Text>
          <Text style={styles.kpiSub}>{spendingTxns.length} expense transactions</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>Top Expense</Text>
          <Text style={[styles.kpiValue, { color: COLORS.primary }]} numberOfLines={1}>
            {highestCategory ? `${highestCategory.label}` : 'None'}
          </Text>
          <Text style={styles.kpiSub}>
            {highestCategory ? `${highestCategory.percentage}% of total` : 'No data'}
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <View style={styles.categorySection}>
          <Text style={styles.sectionHeading}>Spending by Category</Text>
          {categories.slice(0, 4).map(item => (
            <View key={item.key} style={styles.catItem}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <Text style={styles.catIcon}>{item.icon}</Text>
                  <Text style={styles.catName}>{item.label}</Text>
                </View>
                <View style={styles.catRight}>
                  <Text style={styles.catAmount}>{formatCurrency(item.amount)}</Text>
                  <Text style={styles.catPercent}>({item.percentage}%)</Text>
                </View>
              </View>
              {/* Progress Bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.max(item.percentage, 4)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* AI Generated Insight Box */}
      <View style={styles.insightBox}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={styles.insightTitle}>Automated Spending Insights</Text>
        </View>
        {insights.map((insight, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  robotEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 1,
  },
  aiBadge: {
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  aiBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.grayText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.darkText,
    marginTop: 4,
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: COLORS.grayText,
  },
  categorySection: {
    marginBottom: 14,
    paddingTop: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkText,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  catItem: {
    marginBottom: 10,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catIcon: {
    fontSize: 14,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkText,
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkText,
  },
  catPercent: {
    fontSize: 11,
    color: COLORS.grayText,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  insightBox: {
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightIcon: {
    fontSize: 14,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: COLORS.primary,
    marginRight: 6,
    lineHeight: 18,
  },
  insightText: {
    fontSize: 12,
    color: '#064E3B',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
});

export default FinancialInsightsCard;
