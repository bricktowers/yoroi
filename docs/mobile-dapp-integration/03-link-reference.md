# Link reference

## Prefixes

Yoroi handles two equivalent prefixes:

| Prefix | Use it when |
|---|---|
| `yoroi://yoroi-wallet.com/w1/…` | The custom scheme. Opens Yoroi directly if it is installed. |
| `https://yoroi-wallet.com/w1/…` | Universal Link / App Link form. Falls back to the web if the wallet is absent. |

`w1` is the format version. Everything on this page is `w1`.

## Building a link

Use the builder from `@yoroi/links` rather than assembling strings — it validates the
parameters and does the encoding for you.

```ts
import { linksYoroiModuleMaker } from '@yoroi/links';

const yoroiLinks = linksYoroiModuleMaker('yoroi'); // or 'https'
```

The module exposes one function per use case:

| Call | Path |
|---|---|
| `yoroiLinks.transfer.request.ada(params)` | `transfer/request/ada` |
| `yoroiLinks.transfer.request.adaWithLink(params)` | `transfer/request/ada-with-link` |
| `yoroiLinks.transfer.request.contractSpend(params)` | `transfer/request/contract-spend` |
| `yoroiLinks.exchange.order.showCreateResult(params)` | `exchange/order/show-create-result` |
| `yoroiLinks.browser.launch.dappUrl(params)` | `browser/launch` |

Each returns a string. Invalid parameters throw `Links.Errors.ParamsValidationFailed`
before you ever open anything — catch it if your parameters come from user input.

## Shared parameters

Every use case accepts these, all optional:

| Parameter | Type | Limit | Meaning |
|---|---|---|---|
| `redirectTo` | string | 2048 | Where Yoroi sends the user afterwards. Must not contain a query string. `http://` is rejected. |
| `message` | string | 256 | A short line shown to the user explaining the request. |
| `appId` | string | 40 | Identifies your application. |
| `isTestnet` | boolean | — | Marks the request as testnet. |
| `isSandbox` | boolean | — | Marks the request as sandbox. |
| `walletId` | string | 40 | Target a specific wallet. |
| `authorization` | string | 256 | Reserved for partner authorisation. |
| `signature` | string | 256 | Reserved for partner request signing. |

Supply a `message`. It is the only text the user sees describing *why* they are being asked
to sign, and a request without one looks anonymous.

## Use cases

### `transfer/request/ada`

Ask the user to send ADA or native tokens. Attach a `datum` to a target to lock funds at a
script address — this is how you deposit into a contract.

| Parameter | Type | Limits |
|---|---|---|
| `targets` | array | 1–5 entries |
| `targets[].receiver` | string | ≤256 |
| `targets[].amounts` | array | 1–10 entries |
| `targets[].amounts[].tokenId` | string | ≤256. `"."` is ADA. |
| `targets[].amounts[].quantity` | string | ≤80. Lovelace for ADA. |
| `targets[].datum` | string | ≤1024, optional. Inline datum, hex. |
| `memo` | string | ≤256, optional |

See the [lock-with-datum recipe](./recipes/lock-with-datum.md).

### `transfer/request/contract-spend`

Spend a UTxO sitting at a Plutus script address. Covered in full in
[Contract spend](./04-contract-spend.md).

### `transfer/request/ada-with-link`

A transfer request that additionally carries a link back to the requesting service.

### `exchange/order/show-create-result`

Show the outcome of an exchange order inside the wallet.

| Parameter | Type | Limits |
|---|---|---|
| `provider` | string | ≤20, required |
| `orderType` | `'buy' \| 'sell'` | required |
| `coin`, `fiat` | string | ≤20, optional |
| `coinAmount`, `fiatAmount` | number | non-negative, optional |
| `status` | `'success' \| 'pending' \| 'failed'` | optional |

### `browser/launch`

Open a URL in the wallet's built-in dApp browser.

| Parameter | Type | Limits |
|---|---|---|
| `dappUrl` | string | required. `http://` is rejected. |

See the [open-a-dapp recipe](./recipes/open-a-dapp.md).

## How parameters are encoded

You do not need to do this yourself, but it helps when reading a link by eye or writing a
test script.

- A scalar becomes an ordinary query parameter.
- An object is JSON-stringified into a single parameter.
- An array becomes one indexed parameter per element, each holding JSON:
  `targets[0]={"receiver":…}&targets[1]={…}`.

The wallet strips the `[n]` suffix and reassembles the array in order.

> Note: `apps/wallet-mobile/scripts/request-ada-*.sh` predate the current schema and use
> `outputs[0]=…`. The parameter is `targets`. Adapt those scripts before relying on them.
