import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ActionButton } from '@/components/savings/ActionButton';
import { SavingsCard } from '@/components/savings/SavingsCard';
import { TransactionLink } from '@/components/savings/TransactionLink';
import { useThemeColor } from '@/hooks/useThemeColor';

export function DepositSection({
  amount,
  onChangeAmount,
  onDeposit,
  txid,
}: {
  amount: string;
  onChangeAmount: (value: string) => void;
  onDeposit: () => void;
  txid: string | null;
}) {
  const borderColor = useThemeColor('border');
  const inputBackground = useThemeColor('card');
  const textColor = useThemeColor('text');

  return (
    <SavingsCard>
      <ThemedText type="subtitle">Deposit ADA</ThemedText>
      <ThemedText>
        Use your Cardano wallet to deposit ADA into the savings contract. You can withdraw the same amount later.
      </ThemedText>
      <View style={styles.fields}>
        <TextInput
          style={[styles.input, { borderColor, backgroundColor: inputBackground, color: textColor }]}
          value={amount}
          onChangeText={onChangeAmount}
          placeholder="Enter amount in ADA"
          keyboardType="numeric"
          placeholderTextColor="#666"
        />
        <ActionButton title="Deposit ADA" onPress={onDeposit} variant="deposit" />
      </View>
      {txid ? <TransactionLink txid={txid} /> : null}
    </SavingsCard>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
