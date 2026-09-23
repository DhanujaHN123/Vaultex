import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const Input = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', error, editable = true, style, rightIcon, onRightIconPress }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, error && styles.inputError, !editable && styles.inputDisabled]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.grayText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          autoCapitalize="none"
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.iconBtn}>
            <Text style={styles.iconText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconBtn}>
            <Text style={styles.iconText}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.darkText, marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 16, color: COLORS.darkText, paddingVertical: 13 },
  inputError: { borderColor: COLORS.error },
  inputDisabled: { backgroundColor: '#f5f5f5' },
  iconBtn: { padding: 6 },
  iconText: { fontSize: 18 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
});

export default Input;
