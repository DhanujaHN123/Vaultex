import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import Button from '../../components/Button';

const SplashScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <Image source={require('../../../assets/logo.jpg')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.tagline}>VAULT BUILT ON TRUST</Text>
          <Text style={styles.subtitle}>Secure. Smart. Seamless banking at your fingertips.</Text>
        </View>
        <View style={styles.btnSection}>
          <Button title="Login" onPress={() => navigation.navigate('PINLogin')} variant="primary" style={styles.btn} />
          <Button title="Create Account" onPress={() => navigation.navigate('CreateAccount')} variant="outline" style={styles.btn} />
        </View>
        <Text style={styles.footer}>© 2024 VaultX. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingVertical: 40 },
  logoSection: { alignItems: 'center', marginTop: 40 },
  logo: { width: 200, height: 200 },
  textSection: { alignItems: 'center', marginVertical: 20 },
  tagline: { fontSize: 18, fontWeight: '800', color: COLORS.primary, letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 15, color: COLORS.grayText, textAlign: 'center', lineHeight: 22 },
  btnSection: { width: '100%', marginBottom: 10 },
  btn: { width: '100%' },
  footer: { fontSize: 12, color: COLORS.grayText, textAlign: 'center', marginTop: 20 },
});

export default SplashScreen;
