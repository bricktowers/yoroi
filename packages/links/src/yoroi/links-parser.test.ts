import {linksYoroiParser} from './links-parser'
import {linksYoroiModuleMaker} from './module'

describe('linksYoroiParser', () => {
  it('should parse transfer request ada', () => {
    const links = linksYoroiModuleMaker('https')
    const requestAdaLink = links.transfer.request.ada({
      targets: [
        {
          receiver: 'exampleReceiver1',
          datum: 'DEADDEAD',
          amounts: [
            {
              tokenId: 'exampleTokenId.name1',
              quantity: '10',
            },
          ],
        },
        {
          receiver: 'exampleReceiver2',
          amounts: [
            {
              tokenId: 'exampleTokenId.name2',
              quantity: '20',
            },
          ],
        },
      ],
      memo: 'exampleMemo',
      authorization: 'uuid-v4',
    })
    const result = linksYoroiParser(requestAdaLink)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/ada',
      params: {
        targets: [
          {
            receiver: 'exampleReceiver1',
            datum: 'DEADDEAD',
            amounts: [
              {
                tokenId: 'exampleTokenId.name1',
                quantity: '10',
              },
            ],
          },
          {
            receiver: 'exampleReceiver2',
            amounts: [
              {
                tokenId: 'exampleTokenId.name2',
                quantity: '20',
              },
            ],
          },
        ],
        memo: 'exampleMemo',
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse transfer request ada with partner info', () => {
    const links = linksYoroiModuleMaker('https')
    const link = links.transfer.request.ada({
      targets: [
        {
          receiver: 'addr_minimal',
          amounts: [{tokenId: 'lovelace', quantity: '1'}],
        },
      ],
      isSandbox: true,
      message: 'hi',
    })

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/ada',
      params: {
        targets: [
          {
            receiver: 'addr_minimal',
            amounts: [{tokenId: 'lovelace', quantity: '1'}],
          },
        ],
        isSandbox: true,
        message: 'hi',
      },
    })
  })

  it('should parse transfer request ada with link', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%252Bcardano%253Aaddr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh%253Famount%253D10&authorization=uuid-v4'

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/ada-with-link',
      params: {
        link: 'web+cardano:addr1qygnpgnmc4twqxe4qnj3pakudc0ysheqwflv8guwwlply7zptg3wjqz84kx3t4re4xpqvs3fu7mvsahwhyxd4q3qq90s7sgxnh?amount=10',
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse transfer request contract spend', () => {
    const links = linksYoroiModuleMaker('yoroi')
    const contractSpendLink = links.transfer.request.contractSpend({
      inputs: [
        {
          txHash:
            '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          outputIndex: 0,
          redeemer: {
            type: 'PlutusV2',
            data: 'DEADDEADDEAD',
            exUnits: {mem: '7000000', steps: '3000000000'},
          },
          scriptReferenceTxHash:
            'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          scriptReferenceOutputIndex: 0,
          scriptHash:
            '0123456789abcdef0123456789abcdef0123456789abcdef01234567',
          scriptSize: 4313,
        },
      ],
      targets: [
        {
          receiver: 'addr1',
          amounts: [
            {
              tokenId: 'lovelace',
              quantity: '1000000',
            },
          ],
          datum: 'DEADDEAD',
        },
      ],
      authorization: 'uuid-v4',
    })
    const result = linksYoroiParser(contractSpendLink)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/contract-spend',
      params: {
        inputs: [
          {
            txHash:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            outputIndex: 0,
            redeemer: {
              type: 'PlutusV2',
              data: 'DEADDEADDEAD',
              exUnits: {mem: '7000000', steps: '3000000000'},
            },
            scriptReferenceTxHash:
              'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            scriptReferenceOutputIndex: 0,
            scriptHash:
              '0123456789abcdef0123456789abcdef0123456789abcdef01234567',
            scriptSize: 4313,
          },
        ],
        targets: [
          {
            receiver: 'addr1',
            amounts: [
              {
                tokenId: 'lovelace',
                quantity: '1000000',
              },
            ],
            datum: 'DEADDEAD',
          },
        ],
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse transfer request contract spend without exUnits', () => {
    const links = linksYoroiModuleMaker('yoroi')
    const link = links.transfer.request.contractSpend({
      inputs: [
        {
          txHash:
            'abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
          outputIndex: 0,
          redeemer: {
            type: 'PlutusV2',
            data: 'DEADDEADDEAD',
          },
          scriptReferenceTxHash:
            'fedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcba',
          scriptReferenceOutputIndex: 1,
          scriptHash:
            '0123456789abcdef0123456789abcdef0123456789abcdef01234567',
          scriptSize: 1,
        },
      ],
      targets: [
        {
          receiver: 'addr1',
          amounts: [{tokenId: 'lovelace', quantity: '2'}],
        },
      ],
      authorization: 'uuid-v4',
    })

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'transfer',
      useCase: 'request/contract-spend',
      params: {
        inputs: [
          {
            txHash:
              'abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
            outputIndex: 0,
            redeemer: {
              type: 'PlutusV2',
              data: 'DEADDEADDEAD',
            },
            scriptReferenceTxHash:
              'fedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcba',
            scriptReferenceOutputIndex: 1,
            scriptHash:
              '0123456789abcdef0123456789abcdef0123456789abcdef01234567',
            scriptSize: 1,
          },
        ],
        targets: [
          {
            receiver: 'addr1',
            amounts: [{tokenId: 'lovelace', quantity: '2'}],
          },
        ],
        authorization: 'uuid-v4',
      },
    })
  })

  it('should parse exchange show create result link', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi&coinAmount=10&coin=ADA&fiatAmount=100&fiat=USD&status=success&orderType=buy'

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'exchange',
      useCase: 'order/show-create-result',
      params: {
        provider: 'yoroi',
        coinAmount: 10,
        coin: 'ADA',
        fiatAmount: 100,
        fiat: 'USD',
        status: 'success',
        orderType: 'buy',
      },
    })
  })

  it('should parse browser launch dapp-url', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=https%3A%2F%2Fcardanospot.io%2Flanding%3Fref%3Dyoroiwallet.com&appId=uuid-v4'

    const result = linksYoroiParser(link)

    expect(result).toEqual({
      version: 1,
      feature: 'browser',
      useCase: 'launch',
      params: {
        dappUrl: 'https://cardanospot.io/landing?ref=yoroiwallet.com',
        appId: 'uuid-v4',
      },
    })
  })

  it('should return null for invalid link', () => {
    const link = 'invalid-link'

    const result = linksYoroiParser(link)

    expect(result).toBeNull()
  })

  it('should return null when path is not recognized', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/unrecognized/path',
    )
    expect(result).toBeNull()
  })

  it('should return null when dappUrl parameter is missing', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/browser/launch?invalidParam=test',
    )
    expect(result).toBeNull()
  })

  it('should return null when dappUrl has malformed encoding', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=%',
    )
    expect(result).toBeNull()
  })

  it('should return null when dappUrl has invalid encoding', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=%invalid',
    )
    expect(result).toBeNull()
  })

  it('should return null when dappUrl parameter is completely missing', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/browser/launch',
    )
    expect(result).toBeNull()
  })

  it('should return null when dappUrl has malformed URL encoding', () => {
    const result = linksYoroiParser(
      'yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=https://example.com?q=test%',
    )
    expect(result).toBeNull()
  })

  it('should return null when ada-with-link is missing link', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?authorization=uuid-v4'
    const result = linksYoroiParser(link)
    expect(result).toBeNull()
  })

  it('should return null when transfer request ada is missing targets', () => {
    const link = 'yoroi://yoroi-wallet.com/w1/transfer/request/ada?memo=test'
    const result = linksYoroiParser(link)
    expect(result).toBeNull()
  })

  it('should return null when contract spend is missing inputs', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/transfer/request/contract-spend?authorization=uuid-v4'
    const result = linksYoroiParser(link)
    expect(result).toBeNull()
  })

  it('should parse exchange show create result with minimal required params', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi&orderType=sell'
    const result = linksYoroiParser(link)
    expect(result).toEqual({
      version: 1,
      feature: 'exchange',
      useCase: 'order/show-create-result',
      params: {
        provider: 'yoroi',
        orderType: 'sell',
      },
    })
  })

  it('should return null when exchange show create result is missing provider', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?orderType=buy'
    const result = linksYoroiParser(link)
    expect(result).toBeNull()
  })

  it('should return null when exchange show create result is missing orderType', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=yoroi'
    const result = linksYoroiParser(link)
    expect(result).toBeNull()
  })

  it('should parse browser launch with redirectTo and appId', () => {
    const link =
      'yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=https%3A%2F%2Fexample.org%2F&redirectTo=https%3A%2F%2Fexample.com%2Fdone&appId=uuid-v4'
    const result = linksYoroiParser(link)
    expect(result).toEqual({
      version: 1,
      feature: 'browser',
      useCase: 'launch',
      params: {
        dappUrl: 'https://example.org/',
        redirectTo: 'https://example.com/done',
        appId: 'uuid-v4',
      },
    })
  })
})
