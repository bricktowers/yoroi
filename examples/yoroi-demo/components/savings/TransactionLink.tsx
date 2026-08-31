import { StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { savingsContract } from '@/constants/savingsContract';

export function TransactionLink({ txid }: { txid: string }) {
  return (
    <ThemedText style={styles.text}>
      Transaction:&nbsp;
      <ExternalLink href={`${savingsContract.explorerTxUrl}/${txid}`}>{txid}</ExternalLink>
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});
