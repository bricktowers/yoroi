import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

type Variant = 'deposit' | 'withdraw';

export function ActionButton({ title, onPress, variant }: { title: string; onPress: () => void; variant: Variant }) {
  return (
    <TouchableOpacity style={[styles.button, styles[variant]]} onPress={onPress}>
      <ThemedText style={styles.label}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  deposit: {
    backgroundColor: '#0033AD',
  },
  withdraw: {
    backgroundColor: '#1FC7D4',
  },
});
