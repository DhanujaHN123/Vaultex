import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#FECACA' },
  icon: { fontSize: 16, marginRight: 8 },
  text: { color: COLORS.error, fontSize: 14, flex: 1 },
});

export default ErrorMessage;
