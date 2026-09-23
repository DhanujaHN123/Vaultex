import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

const EmptyState = ({ icon = '📭', title = 'Nothing here', subtitle = '', action, actionLabel }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    {action && <TouchableOpacity style={styles.btn} onPress={action}><Text style={styles.btnText}>{actionLabel || 'Retry'}</Text></TouchableOpacity>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.darkText, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.grayText, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default EmptyState;
