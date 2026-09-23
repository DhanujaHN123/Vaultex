import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { insuranceService } from '../../api/services/insuranceService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TYPES = [
  { key: 'health', label: 'Health Insurance', icon: '❤️‍🩹', color: '#EF4444', desc: 'Cover medical expenses for you and your family' },
  { key: 'life', label: 'Life Insurance', icon: '🛡️', color: '#8B5CF6', desc: 'Secure your family\'s financial future' },
  { key: 'vehicle', label: 'Vehicle Insurance', icon: '🚗', color: '#3B82F6', desc: 'Protect your vehicle against accidents & theft' },
  { key: 'home', label: 'Home Insurance', icon: '🏠', color: '#F59E0B', desc: 'Safeguard your home and belongings' },
];

const StatusBadge = ({ status }) => {
  const colors = { active: [COLORS.success, '#D1FAE5'], expired: [COLORS.error, '#FEE2E2'], pending: [COLORS.warning, '#FEF3C7'] };
  const [text, bg] = colors[status] || [COLORS.grayText, '#F3F4F6'];
  return <View style={[styles.badge, { backgroundColor: bg }]}><Text style={[styles.badgeText, { color: text }]}>{status}</Text></View>;
};

const InsuranceScreen = ({ navigation }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    insuranceService.getPolicies().then(r => setPolicies(r.data.data)).catch(() => setError('Failed to load policies.')).finally(() => setLoading(false));
  }, []);

  const handleExplore = (type) => {
    Alert.alert(`Apply for ${type.label}`, `Starting from ₹${type.key === 'health' ? '500' : type.key === 'life' ? '2,000' : type.key === 'vehicle' ? '3,000' : '1,500'}/year\n\nWould you like to apply?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Apply', onPress: async () => {
        try {
          await insuranceService.applyPolicy({ type: type.key, provider: 'VaultX Insurance', premium: 10000, sumAssured: 500000 });
          Alert.alert('✅ Applied!', 'Your insurance application has been submitted. We\'ll get back to you within 24 hours.');
          const res = await insuranceService.getPolicies();
          setPolicies(res.data.data);
        } catch (e) {
          Alert.alert('Error', e.response?.data?.message || 'Failed to apply.');
        }
      }}
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading insurance..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Insurance</Text>
          <View style={{ width: 60 }} />
        </View>

        <ErrorMessage message={error} />

        {/* My Policies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Policies ({policies.length})</Text>
          {policies.length === 0 ? (
            <EmptyState icon="🛡️" title="No policies yet" subtitle="Explore our insurance plans below" />
          ) : (
            policies.map(p => {
              const typeInfo = TYPES.find(t => t.key === p.type);
              return (
                <View key={p._id} style={styles.policyCard}>
                  <View style={styles.policyHeader}>
                    <View style={[styles.policyIcon, { backgroundColor: (typeInfo?.color || COLORS.primary) + '20' }]}>
                      <Text style={{ fontSize: 24 }}>{typeInfo?.icon || '🛡️'}</Text>
                    </View>
                    <View style={styles.policyInfo}>
                      <Text style={styles.policyName}>{p.provider}</Text>
                      <Text style={styles.policyType}>{typeInfo?.label || p.type}</Text>
                    </View>
                    <StatusBadge status={p.status} />
                  </View>
                  <View style={styles.policyDetails}>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Policy No.</Text><Text style={styles.detailVal}>{p.policyNumber}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Premium</Text><Text style={styles.detailVal}>{formatCurrency(p.premium)}/yr</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Sum Assured</Text><Text style={styles.detailVal}>{formatCurrency(p.sumAssured)}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Renewal</Text><Text style={styles.detailVal}>{formatDate(p.renewalDate)}</Text></View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Explore Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Plans</Text>
          {TYPES.map(type => (
            <TouchableOpacity key={type.key} style={styles.exploreCard} onPress={() => handleExplore(type)}>
              <View style={[styles.exploreIcon, { backgroundColor: type.color + '20' }]}><Text style={{ fontSize: 28 }}>{type.icon}</Text></View>
              <View style={styles.exploreInfo}>
                <Text style={styles.exploreName}>{type.label}</Text>
                <Text style={styles.exploreDesc}>{type.desc}</Text>
              </View>
              <Text style={[styles.exploreArrow, { color: type.color }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  policyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  policyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  policyIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  policyInfo: { flex: 1 },
  policyName: { fontSize: 15, fontWeight: '700', color: COLORS.darkText },
  policyType: { fontSize: 13, color: COLORS.grayText, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  policyDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, gap: 8 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: COLORS.grayText },
  detailVal: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
  exploreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10, elevation: 1 },
  exploreIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  exploreInfo: { flex: 1 },
  exploreName: { fontSize: 15, fontWeight: '700', color: COLORS.darkText },
  exploreDesc: { fontSize: 12, color: COLORS.grayText, marginTop: 3, lineHeight: 18 },
  exploreArrow: { fontSize: 28, fontWeight: '700' },
});

export default InsuranceScreen;
