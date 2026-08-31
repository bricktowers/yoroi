import { useLinkingURL } from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';

import { parseYoroiReturn, type YoroiFlow } from '@/lib/yoroiSavings';

/**
 * Yoroi redirects to `yoroidemo://?txid=<hash>` after signing. The return carries
 * nothing but the hash, so the app remembers which flow it launched: call
 * `expectFlow` immediately before opening a link.
 */
export function useYoroiReturnTx() {
  const url = useLinkingURL();
  const [depositTxId, setDepositTxId] = useState<string | null>(null);
  const [withdrawTxId, setWithdrawTxId] = useState<string | null>(null);
  const pendingFlow = useRef<YoroiFlow>('deposit');

  const expectFlow = useCallback((flow: YoroiFlow) => {
    pendingFlow.current = flow;
  }, []);

  useEffect(() => {
    const txid = parseYoroiReturn(url);
    if (!txid) {
      return;
    }

    if (pendingFlow.current === 'withdraw') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link is an external event
      setWithdrawTxId(txid);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- deep-link is an external event
    setDepositTxId(txid);
    setWithdrawTxId(null);
  }, [url]);

  return { depositTxId, withdrawTxId, expectFlow };
}
