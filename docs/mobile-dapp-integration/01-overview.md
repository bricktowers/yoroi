# Overview

## The problem

On desktop, a dApp talks to a wallet through an injected provider: the wallet extension
places an object in the page, the dApp calls it, and the two share a session.

On mobile there is no shared page. A dApp and a wallet are separate applications, each
sandboxed, with no common runtime to inject into. Historically this left mobile dApps on
Cardano with no clean way to have a transaction signed — the user was pushed to a desktop
browser, or the dApp had to hold keys itself.

## The model

This integration uses the mechanism mobile platforms already provide for one app to hand
work to another: a URI that the operating system routes to a registered handler —
Universal Links on iOS, App Links on Android.

1. **Your dApp builds a link.** It describes what should happen: which script UTxOs to
   spend, which redeemer to use, where the funds should go, and where to send the user
   afterwards.
2. **The OS routes it to Yoroi.** Your app calls `Linking.openURL` and control leaves it.
3. **Yoroi validates the request.** Unknown or malformed parameters are rejected before
   anything is shown to the user.
4. **The user reviews and confirms.** Yoroi shows a disclaimer and a review screen. Nothing
   is signed without an explicit confirmation.
5. **Yoroi builds, signs and submits** the transaction, computing fees, collateral and
   change itself.
6. **The user is returned to your dApp**, with the transaction hash appended to the return
   URL you supplied.

## What this means for your architecture

**Your app never holds keys.** It never sees a private key, a seed phrase or a signature.
It describes an intent; the wallet decides how to satisfy it.

**Control genuinely leaves your process.** Between step 2 and step 6 your app may be
backgrounded or evicted. Anything you need after the round trip must survive that — treat
the return like a cold start, not a callback.

**There is no session.** Every request is self-contained. There is no connect step, no
handshake and nothing to keep alive. That is a simplification, but it also means the wallet
tells you nothing about itself — you do not learn the user's address, balance or network
from this integration.

**The response is one value.** You get a transaction hash. Everything else you need, you
read from the chain yourself.

## When this is the right tool

It fits when a user is holding a phone, has Yoroi installed on that same phone, and needs
to authorise something. It is not a remote-signing protocol, not a wallet-connect
replacement, and not a way to query wallet state.
