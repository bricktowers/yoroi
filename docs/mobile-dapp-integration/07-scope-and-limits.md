# Scope and limits

What the integration supports today, stated plainly so you can tell early whether it fits.

## Supported

- **Locking funds into a script**, with an inline datum attached to the output.
- **Spending from a script**, supplying any redeemer your validator accepts.
- **ADA and native tokens**, across multiple outputs.
- **Reference scripts** — the validator is read from a UTxO already on chain.
- Fee estimation, collateral selection and change, all handled by the wallet.

## Limits

**Plutus V3.** The request format carries a version and the wallet sets the language tag
from it, but the cost models the wallet supplies when hashing script data are the V3 set.
V3 is the version to build against.

**One script input per request.** Every redeemer in a request is built with the same input
index, so a request naming two script UTxOs would associate the wrong redeemer with one of
them. Spend one script UTxO at a time.

**Reference scripts only.** `scriptReferenceTxHash` and `scriptReferenceOutputIndex` are
required. There is no way to attach the script itself to the transaction, so the validator
must already be published on chain as a reference script.

**Inline datums only.** Script data is hashed without a datum witness list, so datums must
be inline on the UTxOs being spent.

**You compute the execution budget.** There is no script evaluation on the device. You
supply `exUnits` (memory and steps) and `scriptSize`, and the wallet uses your numbers for
fee calculation. Values that are too low produce a transaction the node rejects; values
that are far too high overpay the fee. See
[Contract spend](./04-contract-spend.md#execution-units-and-script-size).

**The return carries only a transaction hash.** No signature, no witness set, no wallet
address. See [Returning to your dApp](./05-returning-to-your-dapp.md).

**`redirectTo` must not contain a query string.** The hash is appended with a literal
`?txid=`, so a return URL that already has `?` produces a malformed result.

## Networks

The wallet and the example app were developed and demonstrated against **preprod**. The
example's on-chain constants — script address, script hash, reference UTxO — are preprod
values and must be replaced for any other network.
