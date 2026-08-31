# yoroi-demo

Expo **dev-client** example that deposits and withdraws preprod ADA on a Plutus savings script by opening Yoroi with CIP-99-style `yoroi://` links.

This app lives under `examples/` so it stays **outside** the Yarn 1 / Lerna workspaces (`apps/*`, `packages/*`). It has its own Yarn 4 lockfile. `contractSpend` is on this fork (`feature/contract-spend`); it is not on the public Emurgo packages.

Full documentation for the integration — the model, the link reference, the contract-spend
parameters, and the platform configuration this app needs — is in
[docs/mobile-dapp-integration](../../docs/mobile-dapp-integration/README.md).

## What it shows

1. Build a `yoroi://` ADA transfer that locks funds at a script address with a datum.
2. Yoroi signs, then returns to `yoroidemo://?txid=<hash>`.
3. Build a `contractSpend` link that spends that UTxO with a PlutusV3 redeemer.

Withdrawals pay the hardcoded demo wallet in `savingsContract.userWalletAddress` (the link schema requires an explicit `receiver`). That is not the Yoroi account that signs.

On-chain constants: `constants/savingsContract.ts`. Preprod only (`isTestnet` / `isSandbox`).

## Setup

Node 22. From this directory (do not use the repo-root Yarn 1 install):

```bash
corepack enable
yarn
yarn android   # or yarn ios
```

`yarn android` prebuilds and installs `io.bricktowers.yoroidemo`. Native `android/` and `ios/` are gitignored.

Yarn may warn that `@yoroi/common` wants `react-native-mmkv@^2.11`. This example pins **3.3.3** so 16 KB page-size Android devices can load the native library. Do not bump to MMKV 4 (different JS API).

```bash
yarn verify   # tsc && eslint && prettier
```

## Cloud builds

Profiles live in `eas.json`. There is no committed EAS project id.

```bash
eas login
yarn build:dev:android
```

## Reading the code

| What | Where |
|---|---|
| Building the deposit and withdraw links | `lib/yoroiSavings.ts` |
| Reading the transaction hash off the return URL | `hooks/useYoroiReturnTx.ts` |
| On-chain constants — preprod, replace for another network | `constants/savingsContract.ts` |
| Android package-visibility declaration | `plugins/withAndroidQueries.js` |
| iOS `LSApplicationQueriesSchemes` | `app.json` |

The return URL is deliberately bare (`yoroidemo://`). Yoroi appends `?txid=<hash>` to it
verbatim, so a return URL that already carries a query string comes back malformed. Which
flow a return belongs to is tracked in app state instead — see `useYoroiReturnTx`.

## Adapting it

`constants/savingsContract.ts` holds values specific to the demo's preprod script: the
script address, script hash, script size, the reference-script UTxO, the datum and the
withdraw redeemer, plus the destination wallet for withdrawals. Replace all of them for
your own contract; nothing else in the app is contract-specific.
