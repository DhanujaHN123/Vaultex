import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';

const FEATURES = [
  { icon: '🏦', title: 'My Accounts', desc: 'View balances & statements', screen: 'Accounts' },
  { icon: '💳', title: 'Cards', desc: 'Debit cards, controls & PIN', screen: 'Cards' },
  { icon: '🧾', title: 'Bills & Utilities', desc: 'Pay electricity, mobile & more', screen: 'Bills' },
  { icon: '🛡️', title: 'Insurance', desc: 'Health, life & vehicle cover', screen: 'Insurance' },
  { icon: '📈', title: 'Investments', desc: 'Mutual funds, stocks & gold', screen: 'Investments' },
  { icon: '💰', title: 'Loans', desc: 'Instant loans & EMI calculator', screen: 'Loans' },
  { icon: '🧮', title: 'EMI Calculator', desc: 'Calculate loan payments', screen: 'EMICalculator' },
  { icon: '📊', title: 'History', desc: 'All past transactions', screen: 'History' },
  { icon: '👤', title: 'Profile', desc: 'Personal details & settings', screen: 'Profile' },
  { icon: '❓', title: 'Help & Support', desc: 'FAQs & customer care', screen: 'Help' },
];

const MoreScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>All Services</Text>
        <Text style={styles.sub}>Access all VaultX banking features</Text>
        <View style={styles.grid}>
          {FEATURES.map(f => (
            <TouchableOpacity key={f.screen} style={styles.card} onPress={() => navigation.navigate(f.screen)}>
              <Text style={styles.icon}>{f.icon}</Text>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.desc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  sub: { fontSize: 14, color: COLORS.grayText, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 1 },
  icon: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginBottom: 4 },
  desc: { fontSize: 11, color: COLORS.grayText, lineHeight: 16 },
});

export default MoreScreen;
