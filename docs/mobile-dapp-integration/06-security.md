# Security

## The trust boundary

A deep link crosses from an untrusted application into a wallet holding user keys. Anything
in the link is attacker-controlled from the wallet's point of view, and the wallet treats
it that way.

The user is the final check. Yoroi shows a disclaimer and a review screen, and nothing is
signed without an explicit confirmation.

## What the wallet enforces

**Strict schemas.** Every request is validated before anything is shown. Unknown parameters
are not ignored — they fail the whole request. This means a typo in a parameter name
produces a rejection rather than a silently different transaction, and it means a link
cannot smuggle extra fields past the parser.

**Length limits on every field.** Listed per use case in the
[link reference](./03-link-reference.md) and [contract spend](./04-contract-spend.md). They
bound how much attacker-supplied data reaches the transaction builder.

**Typed values.** Output indices must be non-negative integers, Plutus versions must be one
of three literals, quantities are bounded strings.

**No insecure redirects.** A `redirectTo` or `dappUrl` beginning `http://` is rejected, so
a signed result cannot be handed back over a cleartext channel.

**Explicit review.** The contract-interaction screen shows a disclaimer before the request
is presented, because a script interaction is harder for a user to reason about than a
plain payment.

## What the wallet does not check

Be clear about this when designing your dApp. These are your responsibility:

**Your script's logic.** The wallet does not evaluate the validator. It builds the
transaction you described; the chain decides whether it is valid.

**Whether the redeemer is correct.** A wrong redeemer produces a transaction the node
rejects, after the user has confirmed it.

**Whether the destination is sensible.** `receiver` is taken as given. The wallet does not
know that an address belongs to the user, to your service, or to anyone else.

**Whether the datum means what you think.** It is passed through as opaque hex.

**Execution budgets.** `exUnits` and `scriptSize` come from you and go straight into the fee
calculation. They are not verified against the script.

## Guidance for dApp developers

**Verify on chain, not on the return.** The response is a transaction hash and nothing
more. It tells you a transaction was submitted — not that it was accepted, and not what it
contained. Read the result from the chain before acting on it.

**Do not treat the return as authentication.** Anything can open your app with a URL
carrying a `txid` parameter. If your backend cares about the outcome, it should look up the
transaction itself rather than trusting a hash your client was handed.

**Write a meaningful `message`.** It is the one line the user sees explaining the request.
Vague text trains people to confirm without reading.

**Keep the return URL bare and registered to your app.** See
[Returning to your dApp](./05-returning-to-your-dapp.md).

**Assume the user may cancel at any point.** There is no cancellation signal — your app
simply never hears back. Design for that as the normal case, not an error.
