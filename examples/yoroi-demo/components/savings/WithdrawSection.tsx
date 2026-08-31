import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ActionButton } from '@/components/savings/ActionButton';
import { SavingsCard } from '@/components/savings/SavingsCard';
import { TransactionLink } from '@/components/savings/TransactionLink';

export function WithdrawSection({ onWithdraw, txid }: { onWithdraw: () => void; txid: string | null }) {
  return (
    <SavingsCard>
      <ThemedText type="subtitle">Withdraw ADA</ThemedText>
      <ThemedText>Spend the deposit UTxO and send that ADA amount back to the demo wallet.</ThemedText>
      <View style={styles.actions}>
        <ActionButton title="Withdraw ADA" onPress={onWithdraw} variant="withdraw" />
      </View>
      {txid ? <TransactionLink txid={txid} /> : null}
    </SavingsCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 8,
  },
});
