#!/bin/zsh

# Simple test with one target, ADA amount, and datum
# Amount: 1 ADA = 1,000,000 lovelaces
# Datum: Example hex-encoded CBOR datum
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/transfer/request/ada?outputs%5B0%5D=%7B%22receiver%22%3A%22addr_test1qzp3w455j8hdusjyv38rkr3cas9hyydfkr3tpwsz2yt8mqxr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qgvjva0%22%2C%22amounts%22%3A%5B%7B%22tokenId%22%3A%22.%22%2C%22quantity%22%3A%221000000%22%7D%5D%2C%22datum%22%3A%22590a4ba2005820deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef01582048656c6c6f20576f726c64%22%7D&memo=Simple%20test%20with%20datum&message=Testing%20basic%20request%2Fada%20with%20datum&appId=yoroi" 