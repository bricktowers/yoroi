import { useState } from 'react';
import { Alert } from 'react-native';

import { ScreenScroll } from '@/components/ScreenScroll';
import { DepositSection } from '@/components/savings/DepositSection';
import { SavingsHeader } from '@/components/savings/SavingsHeader';
import { WithdrawSection } from '@/components/savings/WithdrawSection';
import { useYoroiReturnTx } from '@/hooks/useYoroiReturnTx';
import { buildDepositLink, buildWithdrawLink, openYoroiUrl, parseAdaAmount } from '@/lib/yoroiSavings';

/**
 * Deposit ADA into the preprod savings script via a Yoroi deep link, then spend
 * that UTxO back to the demo wallet. The deposit txid arrives on the return URL.
 */
export default function HomeScreen() {
  const [amount, setAmount] = useState('');
  const { depositTxId, withdrawTxId, expectFlow } = useYoroiReturnTx();

  const handleDeposit = async () => {
    const parsed = parseAdaAmount(amount);
    if (!parsed.ok) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount of ADA to deposit.');
      return;
    }

    expectFlow('deposit');
    const result = await openYoroiUrl(buildDepositLink(parsed.lovelace));
    if (!result.ok) {
      Alert.alert('Error', result.message);
    }
  };

  const handleWithdraw = async () => {
    if (!depositTxId) {
      Alert.alert('No deposit', 'Deposit ADA first so the app has a transaction to spend.');
      return;
    }

    const parsed = parseAdaAmount(amount);
    if (!parsed.ok) {
      Alert.alert('Invalid Amount', 'Please enter the ADA amount that was deposited.');
      return;
    }

    expectFlow('withdraw');
    const result = await openYoroiUrl(buildWithdrawLink(depositTxId, parsed.lovelace));
    if (!result.ok) {
      Alert.alert('Error', result.message);
    }
  };

  return (
    <ScreenScroll header={<SavingsHeader />}>
      <DepositSection amount={amount} onChangeAmount={setAmount} onDeposit={handleDeposit} txid={depositTxId} />
      <WithdrawSection onWithdraw={handleWithdraw} txid={withdrawTxId} />
    </ScreenScroll>
  );
}
