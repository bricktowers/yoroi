# Troubleshooting

## Nothing happens when I open the link

`Linking.canOpenURL` returns `false`, so your code never calls `openURL`.

Almost always a missing platform declaration: `LSApplicationQueriesSchemes` on iOS, or the
`<queries>` intent on Android 11+. See
[Returning to your dApp](./05-returning-to-your-dapp.md#platform-configuration).

Also confirm Yoroi is actually installed on the device or simulator, and that it is a build
containing this integration — see [Build and run](./08-build-and-run.md).

## The builder throws before I open anything

`Links.Errors.ParamsValidationFailed` comes from schema validation. The message names the
failing field.

Common causes: a parameter that is not part of the schema (they are strict — unknown keys
fail), a number where a string is expected (`quantity` and `exUnits` are strings), or a
value over its length limit.

## Yoroi opens but rejects the request

The link parsed but failed validation on the wallet side. Check for a `redirectTo` starting
`http://`, and for array parameters that are not indexed correctly — each element needs its
own `targets[0]=`, `targets[1]=` parameter holding JSON.

## The user signs, but the transaction is rejected by the node

**Script data hash mismatch.** Usually the Plutus version: build against V3, and check that
the datum on the UTxO you are spending is inline rather than a hash.

**Execution budget too low.** `exUnits` values below what the script actually consumes
produce a transaction the chain will not accept. Evaluate against the real script rather
than guessing.

**Wrong redeemer.** The validator ran and refused. The wallet cannot catch this — it does
not evaluate your script.

## Insufficient collateral

Collateral is taken from the user's own ADA and must be free — not locked in another UTxO
and not already committed. A wallet with only script-locked funds, or with a single UTxO
that is also being spent, cannot provide it.

## The user comes back but my app sees no transaction id

Check your return URL for a query string. `yourapp://?flow=x` becomes
`yourapp://?flow=x?txid=…`, which parses with no `txid`. Keep `redirectTo` bare and track
context in the path or in app state.

If the user cancelled, no return happens at all — that is expected behaviour, not a bug.

## The return arrives but my app has lost its state

Your app may be evicted while Yoroi is in the foreground. Persist anything you need before
opening the link and restore it on the return.

## I spend the wrong UTxO when there are several

Send one script input per request. See [Scope and limits](./07-scope-and-limits.md).
