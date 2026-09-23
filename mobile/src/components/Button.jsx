import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const getStyle = () => {
    switch (variant) {
      case 'secondary': return [styles.btn, styles.secondary];
      case 'outline': return [styles.btn, styles.outline];
      case 'danger': return [styles.btn, styles.danger];
      default: return [styles.btn, styles.primary];
    }
  };
  const getTextStyle = () => {
    if (variant === 'outline') return [styles.text, styles.outlineText];
    return styles.text;
  };
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[...getStyle(), (disabled || loading) && styles.disabled, style]}>
      {loading ? <ActivityIndicator color={variant === 'outline' ? COLORS.primary : '#fff'} /> : <Text style={getTextStyle()}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: 12, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', marginVertical: 6 },
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.primaryDark },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
  danger: { backgroundColor: '#EF4444' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
  outlineText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
});

export default Button;
