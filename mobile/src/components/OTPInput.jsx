import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const OTPInput = ({ value, onChange, length = 6 }) => {
  const inputs = useRef([]);
  const otp = value.split('');

  const handleChange = (text, index) => {
    const digits = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = otp.slice();
    newOtp[index] = digits;
    onChange(newOtp.join(''));
    if (digits && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={ref => inputs.current[i] = ref}
          style={[styles.box, otp[i] && styles.boxFilled]}
          value={otp[i] || ''}
          onChangeText={text => handleChange(text, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 16 },
  box: { width: 48, height: 56, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, fontSize: 22, fontWeight: '700', color: COLORS.darkText, backgroundColor: '#fff' },
  boxFilled: { borderColor: COLORS.primary },
});

export default OTPInput;
