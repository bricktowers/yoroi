# Mobile dApp integration with Yoroi

A mobile dApp can ask Yoroi, running on the same device, to build and sign a Cardano
transaction — including interactions with Plutus scripts — and then hand the user back
with the resulting transaction hash.

There is no injected provider, no wallet SDK to embed and no persistent session. Your
app constructs a URI, the operating system routes it to Yoroi, the user reviews and
confirms, and Yoroi returns to your app.

```
your dApp  ──deep link──▶  Yoroi  ──signed tx──▶  Cardano
    ▲                                                 │
    └──────────  yoroidemo://?txid=<hash>  ◀───────────┘
```

## Where to start

| If you want to … | Read |
|---|---|
| understand the model before committing | [Overview](./01-overview.md) |
| get a signed transaction working today | [Quick start](./02-quick-start.md) |
| look up a parameter | [Link reference](./03-link-reference.md) |
| spend from a Plutus script | [Contract spend](./04-contract-spend.md) |
| get the user back into your app | [Returning to your dApp](./05-returning-to-your-dapp.md) |
| know what the wallet validates | [Security](./06-security.md) |
| know what is and isn't supported | [Scope and limits](./07-scope-and-limits.md) |
| build the wallet yourself | [Build and run](./08-build-and-run.md) |
| work out why something fails | [Troubleshooting](./09-troubleshooting.md) |

## Examples gallery

Every runnable example and request recipe is listed in the
[examples gallery](../../examples/README.md). The recipes themselves:

- [Lock funds into a contract](./recipes/lock-with-datum.md)
- [Spend from a contract](./recipes/spend-from-contract.md)
- [Request a simple ADA payment](./recipes/simple-ada-transfer.md)
- [Open a dApp in the wallet browser](./recipes/open-a-dapp.md)

## Project close-out report

This integration was built under Project Catalyst Fund 13, project 1300099. The close-out
report covering the whole project is in this repository:
[PCR.pdf](../PCR.pdf) · [PCR.md](../PCR.md).

## Working example

[`examples/yoroi-demo`](../../examples/yoroi-demo) is a small Expo app that does the whole
round trip on preprod: it locks ADA into a savings script with a datum, then spends that
UTxO back out with a redeemer. Every snippet in these docs matches code in that app.
