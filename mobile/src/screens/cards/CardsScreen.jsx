import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { cardService } from '../../api/services/cardService';

const CardsScreen = ({ navigation }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  useEffect(() => {
    cardService.getCards().then(r => { setCards(r.data.data); if (r.data.data.length > 0) setSelectedCard(r.data.data[0]); })
      .catch(() => setError('Failed to load cards.')).finally(() => setLoading(false));
  }, []);

  const handleFreeze = async () => {
    if (!selectedCard) return;
    try {
      const res = await cardService.freezeCard(selectedCard._id);
      const updated = res.data.data;
      setCards(prev => prev.map(c => c._id === updated._id ? updated : c));
      setSelectedCard(updated);
      Alert.alert('Done', `Card ${updated.isFrozen ? 'frozen' : 'unfrozen'} successfully.`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update card.');
    }
  };

  const handleBlock = () => {
    Alert.alert('Block Card', '⚠️ This will permanently block your card. This action cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: async () => {
        try {
          const res = await cardService.blockCard(selectedCard._id);
          const updated = res.data.data;
          setCards(prev => prev.map(c => c._id === updated._id ? updated : c));
          setSelectedCard(updated);
          Alert.alert('Done', 'Card has been blocked. Contact support for a replacement.');
        } catch (e) {
          Alert.alert('Error', 'Failed to block card.');
        }
      }}
    ]);
  };

  const handleChangePIN = async () => {
    if (!newPin || !/^\d{4}$/.test(newPin)) { Alert.alert('Error', 'New PIN must be 4 digits.'); return; }
    setPinLoading(true);
    try {
      await cardService.changeCardPin(selectedCard._id, currentPin, newPin);
      Alert.alert('✅ Success', 'Card PIN changed successfully.');
      setShowPinChange(false); setCurrentPin(''); setNewPin('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change PIN.');
    } finally {
      setPinLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading cards..." />;

  const networkColors = { rupay: ['#FF6B00', '#FF9A3C'], visa: ['#1A1F71', '#3B4BBD'], mastercard: ['#EB001B', '#F79E1B'] };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>My Cards</Text>
          <View style={{ width: 60 }} />
        </View>

        <ErrorMessage message={error} />

        {cards.length === 0 ? (
          <EmptyState icon="💳" title="No cards found" subtitle="Cards are created automatically for your account" />
        ) : (
          <>
            {/* Card Selector */}
            {cards.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 12 }}>
                {cards.map(c => (
                  <TouchableOpacity key={c._id} style={[styles.miniCard, selectedCard?._id === c._id && styles.miniCardActive]} onPress={() => setSelectedCard(c)}>
                    <Text style={styles.miniCardText}>••••{c.last4}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {selectedCard && (
              <>
                {/* Visual Card */}
                <View style={[styles.card, selectedCard.isFrozen && styles.cardFrozen]}>
                  {selectedCard.isFrozen && (
                    <View style={styles.frozenOverlay}><Text style={styles.frozenText}>🔒 FROZEN</Text></View>
                  )}
                  <View style={styles.cardTop}>
                    <Text style={styles.cardBrand}>VaultX</Text>
                    <Text style={styles.cardNetwork}>{(selectedCard.network || 'rupay').toUpperCase()}</Text>
                  </View>
                  <View style={styles.chipRow}><Text style={styles.chip}>▬▬▬</Text></View>
                  <Text style={styles.cardNumber}>{selectedCard.cardNumber || `****-****-****-${selectedCard.last4}`}</Text>
                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.cardLabel}>CARD HOLDER</Text>
                      <Text style={styles.cardHolder}>{selectedCard.holderName}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>VALID THRU</Text>
                      <Text style={styles.cardExpiry}>{selectedCard.expiryMonth}/{selectedCard.expiryYear}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: selectedCard.status === 'active' ? '#10B981' : '#EF4444' }]}>
                    <Text style={styles.statusText}>{selectedCard.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.actionsGrid}>
                  <TouchableOpacity style={styles.action} onPress={handleFreeze} disabled={selectedCard.status === 'blocked'}>
                    <Text style={styles.actionIcon}>{selectedCard.isFrozen ? '🔓' : '🔒'}</Text>
                    <Text style={styles.actionLabel}>{selectedCard.isFrozen ? 'Unfreeze' : 'Freeze'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.action} onPress={() => setShowPinChange(true)} disabled={selectedCard.status === 'blocked'}>
                    <Text style={styles.actionIcon}>🔑</Text>
                    <Text style={styles.actionLabel}>Change PIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, styles.actionDanger]} onPress={handleBlock} disabled={selectedCard.status === 'blocked'}>
                    <Text style={styles.actionIcon}>🚫</Text>
                    <Text style={[styles.actionLabel, { color: COLORS.error }]}>Block Card</Text>
                  </TouchableOpacity>
                </View>

                {showPinChange && (
                  <View style={styles.pinSection}>
                    <Text style={styles.pinTitle}>Change Card PIN</Text>
                    <Input label="Current PIN" value={currentPin} onChangeText={setCurrentPin} placeholder="Enter current PIN" keyboardType="numeric" secureTextEntry />
                    <Input label="New PIN (4 digits)" value={newPin} onChangeText={setNewPin} placeholder="Enter new 4-digit PIN" keyboardType="numeric" secureTextEntry />
                    <View style={styles.pinActions}>
                      <Button title="Cancel" variant="outline" onPress={() => { setShowPinChange(false); setCurrentPin(''); setNewPin(''); }} style={{ flex: 1, marginRight: 8 }} />
                      <Button title="Change PIN" onPress={handleChangePIN} loading={pinLoading} style={{ flex: 1 }} />
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}
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
  miniCard: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 10, borderWidth: 2, borderColor: COLORS.border },
  miniCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  miniCardText: { color: COLORS.darkText, fontWeight: '700', fontFamily: 'monospace' },
  card: { backgroundColor: COLORS.primaryDark, borderRadius: 20, marginHorizontal: 16, padding: 22, marginBottom: 20, elevation: 8, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, overflow: 'hidden' },
  cardFrozen: { opacity: 0.7 },
  frozenOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 20 },
  frozenText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardBrand: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardNetwork: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginTop: 4 },
  chipRow: { marginBottom: 20 },
  chip: { color: '#C9A84C', fontSize: 18 },
  cardNumber: { color: '#fff', fontSize: 18, fontFamily: 'monospace', letterSpacing: 4, marginBottom: 20, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 2 },
  cardHolder: { color: '#fff', fontSize: 14, fontWeight: '700', textTransform: 'uppercase' },
  cardExpiry: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statusBadge: { position: 'absolute', top: 14, right: 14, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  action: { flex: 1, minWidth: '28%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', elevation: 1 },
  actionDanger: { backgroundColor: '#FEF2F2' },
  actionIcon: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.darkText, textAlign: 'center' },
  pinSection: { backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 16, elevation: 2 },
  pinTitle: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 12 },
  pinActions: { flexDirection: 'row', marginTop: 8 },
});

export default CardsScreen;
