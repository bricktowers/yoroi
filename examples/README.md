# Examples gallery

Code examples for integrating a mobile dApp with Yoroi. Each one is runnable or
copy-pasteable, and every request they build is covered by the
[integration documentation](../docs/mobile-dapp-integration/README.md).

## Runnable applications

| Example | What it demonstrates |
|---|---|
| [`yoroi-demo`](./yoroi-demo) | A savings dApp on Cardano preprod: locks ADA into a Plutus script with a datum, then spends that UTxO back out with a redeemer. Shows the full round trip — building the link, handing off to Yoroi, and reading the transaction hash off the return URL. Expo dev-client, Yarn 4. |

## Request recipes

One page per use case: the code that builds the link, the wallet screen it opens,
and what comes back.

| Recipe | What it does |
|---|---|
| [Lock funds into a contract](../docs/mobile-dapp-integration/recipes/lock-with-datum.md) | Deposit ADA at a script address with an inline datum attached |
| [Spend from a contract](../docs/mobile-dapp-integration/recipes/spend-from-contract.md) | Unlock a script UTxO by supplying the redeemer the validator expects |
| [Request a simple ADA payment](../docs/mobile-dapp-integration/recipes/simple-ada-transfer.md) | Ask the user to send ADA or native tokens, to one or several recipients |
| [Open a dApp in the wallet browser](../docs/mobile-dapp-integration/recipes/open-a-dapp.md) | Hand a URL to Yoroi's built-in dApp browser |

## Test scripts

`apps/wallet-mobile/scripts/request-ada-*.sh` fire a deep link at a booted iOS
simulator or Android emulator, so a request can be exercised without a device. They
predate the current schema — see
[Build and run](../docs/mobile-dapp-integration/08-build-and-run.md).

## A note on the workspace

Apps in this folder are **not** Yarn 1 / Lerna workspaces. Each example owns its
package manager and lockfile. Do not add them to root `package.json` `workspaces`
or `lerna.json`.
