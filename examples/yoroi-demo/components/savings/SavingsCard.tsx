import type { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export function SavingsCard({ children }: PropsWithChildren) {
  const backgroundColor = useThemeColor('card');

  return <ThemedView style={[styles.card, { backgroundColor }]}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
