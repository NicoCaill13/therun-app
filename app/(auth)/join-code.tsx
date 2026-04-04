import type { ReactElement } from 'react';

import { StyleSheet, Text, View } from 'react-native';

export default function JoinCodeScreen(): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Run</Text>
      <Text style={styles.hint}>Placeholder — wire join flow next.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  hint: {
    color: '#adaaaa',
    marginTop: 8,
    fontSize: 14,
  },
});
