import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const PINPad = ({ pin, onPinChange, maxLength = 4 }) => {
  const handlePress = (val) => {
    if (val === 'del') {
      if (pin.length > 0) onPinChange(pin.slice(0, -1));
    } else {
      if (pin.length < maxLength) {
        const newPin = pin + val;
        onPinChange(newPin);
      }
    }
  };

  const keys = ['1','2','3','4','5','6','7','8','9','*','0','del'];

  return (
    <View style={styles.container}>
      {/* PIN Dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: maxLength }).map((_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </View>
      {/* Keypad */}
      <View style={styles.keypad}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.key, key === '*' && styles.keyDisabled]}
            onPress={() => key !== '*' && handlePress(key)}
            disabled={key === '*'}
          >
            <Text style={[styles.keyText, key === 'del' && styles.delText]}>
              {key === 'del' ? '⌫' : key === '*' ? '' : key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 28, gap: 16 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.primary, backgroundColor: 'transparent' },
  dotFilled: { backgroundColor: COLORS.primary },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280 },
  key: { width: 80, height: 70, justifyContent: 'center', alignItems: 'center', margin: 6, borderRadius: 40, backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  keyDisabled: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  keyText: { fontSize: 24, fontWeight: '600', color: COLORS.darkText },
  delText: { fontSize: 22 },
});

export default PINPad;
