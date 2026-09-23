import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { supportService } from '../../api/services/supportService';

const HelpScreen = ({ navigation }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});
  const [showContact, setShowContact] = useState(false);
  const [issueType, setIssueType] = useState('Payment Issue');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async (q = '') => {
    setLoading(true);
    try {
      const res = await supportService.getFAQs(q);
      setFaqs(res.data.data);
    } catch (e) {
      console.log('FAQ fetch error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (catIdx, itemIdx) => {
    const key = `${catIdx}_${itemIdx}`;
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitIssue = async () => {
    if (!description.trim()) { Alert.alert('Error', 'Please describe your issue'); return; }
    setSubmitting(true);
    try {
      const res = await supportService.createSupportRequest({ issueType, description: description.trim() });
      Alert.alert('✅ Request Submitted', `Ticket: ${res.data.data.ticketNumber}\n\nOur support team will get back to you within 24 hours.`);
      setShowContact(false);
      setDescription('');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={v => { setSearch(v); fetchFAQs(v); }}
            placeholder="Search help topics & FAQs..."
            placeholderTextColor={COLORS.grayText}
          />
        </View>

        {/* Quick Contact Buttons */}
        <View style={styles.quickContact}>
          <TouchableOpacity style={styles.qcBtn} onPress={() => Alert.alert('Call Support', 'Available Mon-Fri, 9am-6pm\n📞 1800-123-VAULT (82858)')}>
            <Text style={styles.qcIcon}>📞</Text>
            <Text style={styles.qcLabel}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qcBtn} onPress={() => Alert.alert('Email Support', 'Write to us at:\n✉️ support@vaultx.bank')}>
            <Text style={styles.qcIcon}>✉️</Text>
            <Text style={styles.qcLabel}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.qcBtn} onPress={() => setShowContact(true)}>
            <Text style={styles.qcIcon}>📝</Text>
            <Text style={styles.qcLabel}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Report Form */}
        {showContact && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Report a Problem</Text>
            <Text style={styles.formLabel}>Issue Category</Text>
            <View style={styles.typesRow}>
              {['Payment Issue', 'Account Access', 'Card Issue', 'Other'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, issueType === t && styles.typeChipActive]} onPress={() => setIssueType(t)}>
                  <Text style={[styles.typeText, issueType === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Describe the Problem" value={description} onChangeText={setDescription} placeholder="Please provide details..." />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <Button title="Cancel" variant="outline" onPress={() => setShowContact(false)} style={{ flex: 1 }} />
              <Button title="Submit" onPress={handleSubmitIssue} loading={submitting} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {loading ? <LoadingSpinner message="Searching FAQs..." /> : faqs.map((cat, catIdx) => (
            <View key={catIdx} style={styles.faqCat}>
              <Text style={styles.faqCatTitle}>{cat.category}</Text>
              {cat.items.map((item, itemIdx) => {
                const isOpen = !!expanded[`${catIdx}_${itemIdx}`];
                return (
                  <TouchableOpacity key={itemIdx} style={styles.faqItem} onPress={() => toggleExpand(catIdx, itemIdx)} activeOpacity={0.7}>
                    <View style={styles.faqQRow}>
                      <Text style={styles.faqQ}>{item.q}</Text>
                      <Text style={styles.faqChevron}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                    {isOpen && <Text style={styles.faqA}>{item.a}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.darkText },
  quickContact: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  qcBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 1 },
  qcIcon: { fontSize: 24, marginBottom: 4 },
  qcLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkText },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.darkText, marginBottom: 8 },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { fontSize: 12, fontWeight: '600', color: COLORS.darkText },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  faqCat: { marginBottom: 16 },
  faqCatTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  faqQRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '600', color: COLORS.darkText, flex: 1, marginRight: 8 },
  faqChevron: { fontSize: 12, color: COLORS.grayText },
  faqA: { fontSize: 13, color: COLORS.grayText, marginTop: 10, lineHeight: 19, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
});

export default HelpScreen;
