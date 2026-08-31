/**
 * CIP-99-style `yoroi://` transfer requests. Yoroi signs, then returns to this app.
 */
import { linksYoroiModuleMaker } from '@yoroi/links';
import { Linking } from 'react-native';

import { savingsContract } from '@/constants/savingsContract';

const ADA_LOVELACE = 1_000_000n;
const yoroiLinks = linksYoroiModuleMaker('yoroi');

export type YoroiFlow = 'deposit' | 'withdraw';

/** ADA unit in Yoroi transfer requests. Native assets use a policy+name token id. */
const ADA_TOKEN_ID = '.';

/**
 * Yoroi returns by appending `?txid=<hash>` to this URL verbatim, so it must not
 * already carry a query string — `a://b?x=1` would come back as `a://b?x=1?txid=…`,
 * which parses with no `txid` at all. Which flow a return belongs to is tracked in
 * app state instead (see `useYoroiReturnTx`).
 */
const RETURN_URL = savingsContract.selfLink;

/** Lovelace is an integer. Cap at 6 fractional ADA digits and use BigInt so `0.1` is exact. */
export function parseAdaAmount(input: string): { ok: true; lovelace: string } | { ok: false } {
  const trimmed = input.trim();
  if (!/^\d+(\.\d{1,6})?$/.test(trimmed)) {
    return { ok: false };
  }
  const [whole, frac = ''] = trimmed.split('.');
  const lovelace = BigInt(whole) * ADA_LOVELACE + BigInt((frac + '000000').slice(0, 6));
  if (lovelace <= 0n) {
    return { ok: false };
  }
  return { ok: true, lovelace: lovelace.toString() };
}

/** Reads the transaction hash Yoroi appended to our return URL. */
export function parseYoroiReturn(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  try {
    return new URL(url).searchParams.get('txid');
  } catch {
    return null;
  }
}

/** Ask Yoroi to send ADA to the script address with the savings datum attached. */
export function buildDepositLink(lovelace: string): string {
  return yoroiLinks.transfer.request.ada({
    targets: [
      {
        receiver: savingsContract.address,
        datum: savingsContract.datum,
        amounts: [{ quantity: lovelace, tokenId: ADA_TOKEN_ID }],
      },
    ],
    message: 'Deposit to the yield-generating long-term savings Demo contract',
    redirectTo: RETURN_URL,
  });
}

/**
 * Spend the deposit UTxO with a PlutusV3 redeemer and send that ADA to the demo wallet.
 * Yoroi loads the script from the reference UTxO (`scriptSize` is for fee / ex-unit budgeting).
 */
export function buildWithdrawLink(depositTxHash: string, lovelace: string): string {
  return yoroiLinks.transfer.request.contractSpend({
    inputs: [
      {
        txHash: depositTxHash,
        outputIndex: 0, // this app's deposit creates a single output
        redeemer: {
          type: 'PlutusV3',
          data: savingsContract.withdrawRedeemer,
          // Fixed generous limits for this demo script — not computed.
          exUnits: {
            mem: '7000000',
            steps: '3000000000',
          },
        },
        scriptReferenceTxHash: savingsContract.scriptReferenceTxHash,
        scriptReferenceOutputIndex: savingsContract.scriptReferenceOutputIndex,
        scriptHash: savingsContract.scriptHash,
        scriptSize: savingsContract.scriptSize,
      },
    ],
    targets: [
      {
        receiver: savingsContract.userWalletAddress,
        amounts: [{ tokenId: ADA_TOKEN_ID, quantity: lovelace }],
      },
    ],
    isSandbox: savingsContract.isSandbox,
    isTestnet: savingsContract.isTestnet,
    message: 'Withdrawal from the Demo long-term savings contract',
    redirectTo: RETURN_URL,
  });
}

/**
 * `canOpenURL` is false on Android 11+ / modern iOS unless `yoroi` is listed in
 * the queries plugin and `LSApplicationQueriesSchemes`.
 */
export async function openYoroiUrl(url: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return { ok: false, message: 'No application found to handle this URL.' };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to open URL.';
    return { ok: false, message };
  }
}
