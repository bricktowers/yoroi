# Build and run

To try the integration you need a Yoroi build that contains it. It is not in a released
version of the wallet.

## The branch

The work lives on `feature/contract-spend` in this fork.

```bash
git clone https://github.com/bricktowers/yoroi.git
cd yoroi
git checkout feature/contract-spend
```

The branch is based on the wallet's `production` line at **v5.3.3**, and is deliberately
not rebased onto a newer upstream base: the transaction-building path was reviewed and
demonstrated against this base, and keeping it means the published code matches the
evidence recorded for it.

## Building the wallet

Follow the repository's own instructions in the root `README.md` and
`apps/wallet-mobile`. A note that will save you time: the project does not build against
the newest Xcode. If the iOS build fails in ways that look unrelated to this code, try an
earlier Xcode before looking anywhere else — the toolchain is the most common cause of
lost time in this repository.

## Building the packages

`@yoroi/links` and `@yoroi/types` are consumed as built packages (`lib/commonjs/index`),
so build the workspace packages once before an app resolving them by `file:` path can
compile.

## Running the example

`examples/` sits outside the Yarn 1 / Lerna workspaces and each example owns its package
manager. See [`examples/yoroi-demo/README.md`](../../examples/yoroi-demo/README.md).

```bash
cd examples/yoroi-demo
corepack enable
yarn
yarn ios      # or: yarn android
```

## Firing links at a simulator

```bash
xcrun simctl openurl booted "yoroi://yoroi-wallet.com/w1/transfer/request/ada?…"
adb shell am start -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/…"
```

`apps/wallet-mobile/scripts/request-ada-*.sh` wrap this, but they predate the current
schema (`outputs[0]=` rather than `targets`) — adapt them before use.

## Where the code lives

| Area | Path |
|---|---|
| Link format, schemas, builder | `packages/links/src/yoroi/` |
| Shared types | `packages/types/src/links/yoroi.ts` |
| Request handling in the wallet | `apps/wallet-mobile/src/features/Links/` |
| Transaction building | `apps/wallet-mobile/src/yoroi-wallets/cardano/tx-builders/` |
| Example dApp | `examples/yoroi-demo/` |

One note for contributors reading the transaction builders: the assembly for contract
spending is implemented inside the application rather than in `@emurgo/yoroi-lib`, where
it would more naturally belong. That library is distributed as a published package without
a public source repository, so it can be called but not extended.
