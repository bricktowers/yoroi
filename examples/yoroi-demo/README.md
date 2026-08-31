# yoroi-demo

Expo **dev-client** example that deposits and withdraws preprod ADA on a Plutus savings script by opening Yoroi with CIP-99-style `yoroi://` links.

This app lives under `examples/` so it stays **outside** the Yarn 1 / Lerna workspaces (`apps/*`, `packages/*`). It has its own Yarn 4 lockfile. `contractSpend` is on this fork (`feature/contract-spend`); it is not on the public Emurgo packages.

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
