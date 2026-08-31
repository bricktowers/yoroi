# Quick start

From nothing to a signed preprod transaction. The fastest honest route is to run the
example app first, then adapt it — it is already wired for both platforms and already has
a working script on chain to talk to.

## What you need

- Node 22 and Corepack
- Xcode (iOS) or Android Studio (Android)
- A Yoroi build containing this integration — see [Build and run](./08-build-and-run.md)
- A preprod wallet with a little ADA in it

## 1 · Run the example

```bash
cd examples/yoroi-demo
corepack enable
yarn
yarn ios      # or: yarn android
```

Deposit a small amount, confirm in Yoroi, and watch the app come back with a transaction
hash it links to Cardanoscan. Then withdraw. That round trip is the whole integration.

If the deposit button does nothing, you are almost certainly missing a platform
declaration — jump to
[Platform configuration](./05-returning-to-your-dapp.md#platform-configuration).

## 2 · Add the package to your own app

`contract-spend` is part of this fork and is **not** in the published `@yoroi/links` on
npm. Depend on the local package:

```json
{
  "dependencies": {
    "@yoroi/links": "file:../../packages/links",
    "@yoroi/types": "file:../../packages/types"
  }
}
```

The package is consumed built — its entry point is `lib/commonjs/index` — so build the
workspace packages once from the repository root before your app resolves them.

Peer dependencies: `zod`, `immer`, `@yoroi/common`, `react`.

## 3 · Declare the platform bits

Without these, `canOpenURL` returns `false` and nothing opens.

`app.json` (Expo):

```json
{
  "expo": {
    "scheme": "yourapp",
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["web+cardano", "yoroi"]
      }
    },
    "plugins": ["./plugins/withAndroidQueries.js"]
  }
}
```

Copy `plugins/withAndroidQueries.js` from the example — it adds the Android 11+ `<queries>`
entry that makes the wallet visible to your app.

## 4 · Build a link and open it

```ts
import { linksYoroiModuleMaker } from '@yoroi/links';
import { Linking } from 'react-native';

const yoroiLinks = linksYoroiModuleMaker('yoroi');

const link = yoroiLinks.transfer.request.ada({
  targets: [
    {
      receiver: 'addr_test1…',
      amounts: [{ tokenId: '.', quantity: '2000000' }], // 2 ADA in lovelace
    },
  ],
  message: 'Send 2 test ADA',
  redirectTo: 'yourapp://',   // no query string — see the note below
  isTestnet: true,
});

if (await Linking.canOpenURL(link)) {
  await Linking.openURL(link);
}
```

## 5 · Handle the return

Yoroi appends the transaction hash to your URL:

```ts
import { useLinkingURL } from 'expo-linking';

const url = useLinkingURL();
const txid = url ? new URL(url).searchParams.get('txid') : null;
```

**`redirectTo` must not contain a query string** — the hash is appended with a literal
`?txid=`, so `yourapp://?x=1` comes back malformed. Keep it bare and track context in your
own state.

## Testing without a device

`apps/wallet-mobile/scripts/` contains helpers that fire a link at a booted simulator or
emulator. They predate the current schema — they use `outputs[0]=` where the parameter is
now `targets` — so adapt them before use. The mechanism is simply:

```bash
xcrun simctl openurl booted "yoroi://yoroi-wallet.com/w1/transfer/request/ada?…"
adb shell am start -a android.intent.action.VIEW -d "yoroi://…"
```

## Next

- [Contract spend](./04-contract-spend.md) — spending from a Plutus script
- [Recipes](./README.md#recipes) — one page per use case
- [Scope and limits](./07-scope-and-limits.md) — read before you design around it
