/**
 * Preprod Plutus savings script this demo deposits into and later spends.
 * Replace the whole object when the on-chain script UTxO, datum, or demo wallet changes.
 */
export const savingsContract = {
  // Yoroi returns here after signing and appends `txid`. `?flow=` is added by this app.
  selfLink: 'yoroidemo://',
  address:
    'addr_test1zqg45elm68dzq3d3g782g5y5vmnpk937yt2d0wn4h77rqku9rk398gms2eh8snp58c9skehndz9ps8ff5rfns7mfafnq8wdjcj',
  // UTxO that stores the script so spenders reference it instead of inlining ~4 KB of bytecode.
  scriptReferenceTxHash: '07741d86c34474e266097bba436202c6d05d8700700fd068ea2413b762cf69dc',
  scriptReferenceOutputIndex: 0,
  scriptHash: '115a67fbd1da2045b1478ea4509466e61b163e22d4d7ba75bfbc305b',
  scriptSize: 4313,
  datum:
    'd8799f50f4a930e4e3a0445c9ffac2262a3ca214581cd811097a1b4a05a272f53f176db2fb5aa5fdd21c4ccb465e3fbf73669fd8799fd87a80581cd811097a1b4a05a272f53f176db2fb5aa5fdd21c4ccb465e3fbf73661864ffd8799fd87980581cd811097a1b4a05a272f53f176db2fb5aa5fdd21c4ccb465e3fbf73661864ffff1b00000197edd8771ad87a80d87a80ff',
  // Constr 0 [I 2] — CBOR `d8799f02ff`.
  withdrawRedeemer: 'd8799f02ff',
  // Contract-spend requires an explicit receiver; this demo always pays this wallet.
  userWalletAddress:
    'addr_test1qrvpzzt6rd9qtgnj75l3wmdjldd2tlwjr3xvk3j787lhxekjrf40rhx8p4neddpnln6kl3xqna0e728y40pr0cfy0fsq6tvc0y',
  explorerTxUrl: 'https://preprod.cardanoscan.io/transaction',
  // Yoroi uses these to select preprod rather than mainnet.
  isSandbox: true,
  isTestnet: true,
} as const;
