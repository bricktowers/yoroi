import {
  decodeBrowserLaunchDappUrl,
  decodeExchangeShowCreateResult,
  decodeTransferRequestAda,
  decodeTransferRequestAdaWithLink,
  encodeBrowserLaunchDappUrl,
  encodeExchangeShowCreateResult,
  encodeTransferRequestAda,
  encodeTransferRequestAdaWithLink,
  encodeTransferRequestContractSpend,
  decodeTransferRequestContractSpend,
} from './transformers'
import {mocks} from './transformers.mocks'

describe('transformers', () => {
  describe('encodeExchangeShowCreateResult', () => {
    it('should encode redirectTo if it is a safe URL', () => {
      const result = encodeExchangeShowCreateResult.parse({
        ...mocks.exchangeShowCreateResult.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.exchangeShowCreateResult.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeExchangeShowCreateResult.parse({
          ...mocks.exchangeShowCreateResult.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should not encode redirectTo when not present', () => {
      const result = encodeExchangeShowCreateResult.parse(
        mocks.exchangeShowCreateResult.params,
      )

      expect(result).toEqual(mocks.exchangeShowCreateResult.result)
    })
  })

  describe('decodeExchangeShowCreateResult', () => {
    it('should decode redirectTo if it is a safe URL', () => {
      const result = decodeExchangeShowCreateResult.parse({
        ...mocks.exchangeShowCreateResult.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.exchangeShowCreateResult.params,
        redirectTo: 'https://example.com',
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeExchangeShowCreateResult.parse({
          ...mocks.exchangeShowCreateResult.result,
          redirectTo:
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
        }),
      ).toThrow()
    })

    it('should not decode redirectTo when not present', () => {
      const params = decodeExchangeShowCreateResult.parse(
        mocks.exchangeShowCreateResult.result,
      )

      expect(params).toEqual(mocks.exchangeShowCreateResult.params)
    })
  })

  describe('encodeTransferRequestAdaWithLink', () => {
    it('should encode link', () => {
      const result = encodeTransferRequestAdaWithLink.parse(
        mocks.transferRequestAdaWithLink.params,
      )

      expect(result).toEqual(mocks.transferRequestAdaWithLink.result)
    })

    it('should encode redirectTo and link', () => {
      const result = encodeTransferRequestAdaWithLink.parse({
        ...mocks.transferRequestAdaWithLink.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.transferRequestAdaWithLink.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        encodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.params,
          link: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('decodeTransferRequestAdaWithLink', () => {
    it('should decode link', () => {
      const result = decodeTransferRequestAdaWithLink.parse(
        mocks.transferRequestAdaWithLink.result,
      )

      expect(result).toEqual(mocks.transferRequestAdaWithLink.params)
    })

    it('should decode redirectTo and link', () => {
      const result = decodeTransferRequestAdaWithLink.parse({
        ...mocks.transferRequestAdaWithLink.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.transferRequestAdaWithLink.params,
        redirectTo: 'https://example.com',
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.result,
          redirectTo: encodeURIComponent(
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
          ),
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        decodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.result,
          link: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('encodeTransferRequestAda', () => {
    it('should encode', () => {
      const result = encodeTransferRequestAda.parse(
        mocks.transferRequestAda.params,
      )

      expect(result).toEqual(mocks.transferRequestAda.result)
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeTransferRequestAda.parse({
          ...mocks.transferRequestAda.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should encode with redirectTo', () => {
      const result = encodeTransferRequestAda.parse({
        ...mocks.transferRequestAda.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.transferRequestAda.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })
  })

  describe('decodeTransferRequestAda', () => {
    it('should decode', () => {
      const result = decodeTransferRequestAda.parse(
        mocks.transferRequestAda.result,
      )

      expect(result).toEqual(mocks.transferRequestAda.params)
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeTransferRequestAda.parse({
          ...mocks.transferRequestAda.result,
          redirectTo: encodeURIComponent(
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
          ),
        }),
      ).toThrow()
    })

    it('should decode with redirectTo', () => {
      const result = decodeTransferRequestAda.parse({
        ...mocks.transferRequestAda.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.transferRequestAda.params,
        redirectTo: 'https://example.com',
      })
    })
  })

  describe('decodeBrowserLaunchDappUrl', () => {
    it('should decode link', () => {
      const result = decodeBrowserLaunchDappUrl.parse(
        mocks.browserLaunchDappUrl.result,
      )

      expect(result).toEqual(mocks.browserLaunchDappUrl.params)
    })

    it('should decode redirectTo and link', () => {
      const result = decodeBrowserLaunchDappUrl.parse({
        ...mocks.browserLaunchDappUrl.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.browserLaunchDappUrl.params,
        redirectTo: 'https://example.com',
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeBrowserLaunchDappUrl.parse({
          ...mocks.browserLaunchDappUrl.result,
          redirectTo: encodeURIComponent(
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
          ),
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        decodeBrowserLaunchDappUrl.parse({
          ...mocks.browserLaunchDappUrl.result,
          dappUrl: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('encodeBrowserLaunchDappUrl', () => {
    it('should encode link', () => {
      const result = encodeBrowserLaunchDappUrl.parse(
        mocks.browserLaunchDappUrl.params,
      )

      expect(result).toEqual(mocks.browserLaunchDappUrl.result)
    })

    it('should encode redirectTo and link', () => {
      const result = encodeBrowserLaunchDappUrl.parse({
        ...mocks.browserLaunchDappUrl.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.browserLaunchDappUrl.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeBrowserLaunchDappUrl.parse({
          ...mocks.browserLaunchDappUrl.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        encodeBrowserLaunchDappUrl.parse({
          ...mocks.browserLaunchDappUrl.params,
          dappUrl: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('encodeTransferRequestContractSpend', () => {
    it('should encode', () => {
      const result = encodeTransferRequestContractSpend.parse({
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
            scriptSize: 100,
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
      })

      expect(result).toEqual({
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
            scriptSize: 100,
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
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeTransferRequestContractSpend.parse({
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
              scriptSize: 100,
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
          redirectTo: 'http://example.com',
        }),
      ).toThrow()
    })

    it('should throw if redirectTo is not a safe URL (correct keys)', () => {
      expect(() =>
        encodeTransferRequestContractSpend.parse({
          inputs: [
            {
              txHash:
                '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              outputIndex: 0,
              redeemer: {
                type: 'PlutusV2',
                data: 'DEADDEADDEAD',
              },
              scriptReferenceTxHash:
                'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              scriptReferenceOutputIndex: 0,
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
          redirectTo: 'http://example.com',
        }),
      ).toThrow()
    })

    it('should encode with redirectTo', () => {
      const result = encodeTransferRequestContractSpend.parse({
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
            scriptSize: 100,
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
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
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
            scriptSize: 100,
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
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })
  })

  describe('decodeTransferRequestContractSpend', () => {
    it('should decode', () => {
      const result = decodeTransferRequestContractSpend.parse({
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
            scriptSize: 100,
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
      })

      expect(result).toEqual({
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
            scriptSize: 100,
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
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeTransferRequestContractSpend.parse({
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
              scriptSize: 100,
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
          redirectTo: encodeURIComponent('http://example.com'),
        }),
      ).toThrow()
    })

    it('should decode with redirectTo', () => {
      const result = decodeTransferRequestContractSpend.parse({
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
            scriptSize: 100,
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
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
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
            scriptSize: 100,
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
        redirectTo: 'https://example.com',
      })
    })
  })
})
