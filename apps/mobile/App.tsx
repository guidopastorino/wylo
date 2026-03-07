import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>wylo</Text>
      <Text style={styles.tagline}>Bienvenido</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: '#94a3b8',
  },
});
