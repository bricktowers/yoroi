/* eslint-disable @typescript-eslint/no-explicit-any */
import {Api} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {YoroiEntry} from '../../types/yoroi'
import {getTransactionSigners} from '../common/signatureUtils'
import {CardanoTypes, YoroiWallet} from '../types'
import {getPlutusV3PreprodHex} from './costModelConstants'

export type WalletInput = {
  txHash: string
  outputIndex: number
  amount: string
  assets: ReadonlyArray<{assetId: string; amount: string}>
}

export type ContractInput = WalletInput & {
  redeemer: {
    type: 'PlutusV1' | 'PlutusV2' | 'PlutusV3'
    data: string
    exUnits?: {mem: string; steps: string}
  }
  scriptReferenceTxHash: string
  scriptReferenceOutputIndex: number
  scriptHash: string
  scriptSize: number
}

export class CslHelper {
  constructor(private csl: any, private protocolParams: Api.Cardano.ProtocolParams) {}

  async createTxBuilderConfig(): Promise<any> {
    const feeAlgo = await this.csl.LinearFee.new(
      await this.csl.BigNum.fromStr(this.protocolParams.linearFee.coefficient),
      await this.csl.BigNum.fromStr(this.protocolParams.linearFee.constant),
    )

    // Add execution unit prices for Plutus script transactions
    const memPrice = await this.csl.UnitInterval.new(
      await this.csl.BigNum.fromStr(this.protocolParams.scriptExecutionPrices.memory.numerator),
      await this.csl.BigNum.fromStr(this.protocolParams.scriptExecutionPrices.memory.denominator),
    )
    const stepPrice = await this.csl.UnitInterval.new(
      await this.csl.BigNum.fromStr(this.protocolParams.scriptExecutionPrices.cpu.numerator),
      await this.csl.BigNum.fromStr(this.protocolParams.scriptExecutionPrices.cpu.denominator),
    )
    const exUnitPrices = await this.csl.ExUnitPrices.new(memPrice, stepPrice)

    const refScriptCoinsPerByte = await this.csl.UnitInterval.new(
      await this.csl.BigNum.fromStr(this.protocolParams.minFeeReferenceScript.coinsPerByte.numerator),
      await this.csl.BigNum.fromStr(this.protocolParams.minFeeReferenceScript.coinsPerByte.denominator),
    )

    let cfgBuilder = await this.csl.TransactionBuilderConfigBuilder.new()
    cfgBuilder = await cfgBuilder.feeAlgo(feeAlgo)
    cfgBuilder = await cfgBuilder.coinsPerUtxoByte(await this.csl.BigNum.fromStr(this.protocolParams.coinsPerUtxoByte))
    cfgBuilder = await cfgBuilder.poolDeposit(await this.csl.BigNum.fromStr(this.protocolParams.poolDeposit))
    cfgBuilder = await cfgBuilder.keyDeposit(await this.csl.BigNum.fromStr(this.protocolParams.keyDeposit))
    cfgBuilder = await cfgBuilder.maxTxSize(Number(this.protocolParams.maxTxSize))
    cfgBuilder = await cfgBuilder.maxValueSize(Number(this.protocolParams.maxValueSize))
    cfgBuilder = await cfgBuilder.exUnitPrices(exUnitPrices)
    cfgBuilder = await cfgBuilder.refScriptCoinsPerByte(refScriptCoinsPerByte)
    return cfgBuilder.build()
  }

  // TODO switch to AddressedWalletInput
  async addInputs(builder: any, walletInputs: ReadonlyArray<WalletInput>, changeAddress: string): Promise<void> {
    for (const input of walletInputs) {
      const txHash = await this.csl.TransactionHash.fromHex(input.txHash)
      const txIn = await this.csl.TransactionInput.new(txHash, input.outputIndex)
      const valBigNum = await this.csl.BigNum.fromStr(input.amount)
      const val = await this.csl.Value.new(valBigNum)
      if (input.assets && input.assets.length > 0) {
        const ma = await this.csl.MultiAsset.new()
        for (const asset of input.assets) {
          const [policyId, assetNameHex] = asset.assetId.split('.')
          const scriptHash = await this.csl.ScriptHash.fromHex(policyId)
          let assetsForPolicy = await ma.get(scriptHash)
          if (!assetsForPolicy) {
            assetsForPolicy = await this.csl.Assets.new()
            await ma.insert(scriptHash, assetsForPolicy)
          }
          const assetNameBytes = Uint8Array.from(Buffer.from(assetNameHex, 'hex'))
          await assetsForPolicy.insert(
            await this.csl.AssetName.new(assetNameBytes),
            await this.csl.BigNum.fromStr(asset.amount),
          )
        }
        await val.setMultiasset(ma)
      }
      const addr = await this.csl.Address.fromBech32(changeAddress)
      const addressBytes = await addr.toBytes()
      const keyHashBytes = addressBytes.slice(1, 29)
      const keyHash = await this.csl.Ed25519KeyHash.fromBytes(keyHashBytes)
      await builder.addKeyInput(keyHash, txIn, val)
    }
  }

  async addOutputs(builder: any, entries: YoroiEntry[]) {
    for (const entry of entries) {
      const outAddr = await this.csl.Address.fromBech32(entry.address)

      const lovelace = await this.csl.BigNum.fromStr(entry.amounts['.'] ?? '0')
      const outVal = await this.csl.Value.new(lovelace)

      // Build multiasset from entry.amounts (exclude primary token '.')
      const assetIds = Object.keys(entry.amounts || {}).filter((id) => id !== '.')
      if (assetIds.length > 0) {
        const multiAsset = await this.csl.MultiAsset.new()
        for (const assetId of assetIds) {
          const [policyId, assetNameHex] = assetId.split('.')
          const scriptHash = await this.csl.ScriptHash.fromHex(policyId)
          let assetsForPolicy = await multiAsset.get(scriptHash)
          if (!assetsForPolicy) {
            assetsForPolicy = await this.csl.Assets.new()
            await multiAsset.insert(scriptHash, assetsForPolicy)
          }
          const assetNameBytes = Uint8Array.from(Buffer.from(assetNameHex, 'hex'))
          const quantity = await this.csl.BigNum.fromStr(entry.amounts[assetId] as string)
          await assetsForPolicy.insert(await this.csl.AssetName.new(assetNameBytes), quantity)
        }
        await outVal.setMultiasset(multiAsset)
      }

      const txOut = await this.csl.TransactionOutput.new(outAddr, outVal)
      if (entry.datum && 'data' in entry.datum && entry.datum.data) {
        const datumData = await this.csl.PlutusData.fromHex((entry.datum as any).data)
        await txOut.setPlutusData(datumData)
      }
      await builder.addOutput(txOut)
    }
  }

  async createMockWitness(signer: number[]): Promise<any> {
    const signerBytes = new Uint8Array(32).fill(0)
    for (let i = 0; i < signer.length; i++) {
      signerBytes[i] = signer[i]
    }
    const dummyPrivateKey = await this.csl.PrivateKey.fromNormalBytes(signerBytes)
    const dummyTxHash = await this.csl.TransactionHash.fromBytes(new Uint8Array(32).fill(0))
    const dummySignature = await dummyPrivateKey.sign(await dummyTxHash.toBytes())
    const dummyVkey = await this.csl.Vkey.new(await dummyPrivateKey.toPublic())
    const dummyVkeyWitness = await this.csl.Vkeywitness.new(dummyVkey, dummySignature)
    return dummyVkeyWitness
  }

  async createMockVkeyWitnesses(txBody: any, wallet: YoroiWallet): Promise<any> {
    const mockWitnessSet = await this.csl.TransactionWitnessSet.new()
    const signerTx = await this.csl.Transaction.new(txBody, mockWitnessSet, undefined)
    const signerTxHex = await signerTx.toHex()
    const meta = {implementation: 'cardano-cip1852'} as any
    const signers: number[][] = await getTransactionSigners(signerTxHex, wallet, meta)
    const witnesses = await Promise.all(signers.map(async (signer) => this.createMockWitness(signer)))

    const mockVkeys = await this.csl.Vkeywitnesses.new()
    for (let i = 0; i < witnesses.length; i++) {
      await mockVkeys.add(witnesses[i])
    }
    await mockWitnessSet.setVkeys(mockVkeys)
    return mockWitnessSet
  }

  async createAuxiliaryData(metadata: Array<CardanoTypes.TxMetadata> | undefined): Promise<any> {
    if (!metadata || metadata.length === 0) {
      return undefined
    }
    const auxiliaryData = await this.csl.AuxiliaryData.new()
    const gtm = await this.csl.GeneralTransactionMetadata.new()
    for (const meta of metadata) {
      const label = await this.csl.BigNum.fromStr(meta.label)
      const data = await this.csl.TransactionMetadatum.newText(meta.data)
      await gtm.insert(label, data)
    }
    await auxiliaryData.setMetadata(gtm)
    return auxiliaryData
  }

  async createRedeemer(ci: ContractInput): Promise<any> {
    const redeemerTag = await this.csl.RedeemerTag.newSpend()
    const inputIndex = await this.csl.BigNum.fromStr('0')
    const redeemerData = await this.csl.PlutusData.fromHex(ci.redeemer.data)
    const exUnits = ci.redeemer.exUnits
      ? await this.csl.ExUnits.new(
          await this.csl.BigNum.fromStr(ci.redeemer.exUnits.mem),
          await this.csl.BigNum.fromStr(ci.redeemer.exUnits.steps),
        )
      : await this.csl.ExUnits.new(await this.csl.BigNum.fromStr('1000'), await this.csl.BigNum.fromStr('1000'))
    const redeemer = await this.csl.Redeemer.new(redeemerTag, inputIndex, redeemerData, exUnits)
    return redeemer
  }

  async createRedeemers(contractInputs: ReadonlyArray<ContractInput>): Promise<any> {
    const redeemers = await this.csl.Redeemers.new()
    for (let i = 0; i < contractInputs.length; i++) {
      const ci = contractInputs[i]
      const redeemer = await this.createRedeemer(ci)
      await redeemers.add(redeemer)
    }
    return redeemers
  }

  async createCostModels(): Promise<any> {
    const costModels = await getPlutusV3PreprodHex(this.csl)
    return costModels
  }

  async addScriptInput(txBuilder: any, ci: ContractInput) {
    const txHash = await this.csl.TransactionHash.fromHex(ci.txHash)
    const txIn = await this.csl.TransactionInput.new(txHash, ci.outputIndex)

    const val = await this.csl.Value.new(await this.csl.BigNum.fromStr(ci.amount))
    if (ci.assets && ci.assets.length > 0) {
      const ma = await this.csl.MultiAsset.new()
      for (const asset of ci.assets) {
        const [policyId, assetNameHex] = asset.assetId.split('.')
        const policyScriptHash = await this.csl.ScriptHash.fromHex(policyId)
        let assetsForPolicy = await ma.get(policyScriptHash)
        if (!assetsForPolicy) {
          assetsForPolicy = await this.csl.Assets.new()
          await ma.insert(policyScriptHash, assetsForPolicy)
        }
        const assetNameBytes = Uint8Array.from(Buffer.from(assetNameHex, 'hex'))
        await assetsForPolicy.insert(
          await this.csl.AssetName.new(assetNameBytes),
          await this.csl.BigNum.fromStr(asset.amount),
        )
      }
      await val.setMultiasset(ma)
    }

    const scriptHash = await this.csl.ScriptHash.fromHex(ci.scriptHash)
    const refInput = await this.csl.TransactionInput.new(
      await this.csl.TransactionHash.fromHex(ci.scriptReferenceTxHash),
      ci.scriptReferenceOutputIndex,
    )

    const language =
      ci.redeemer?.type === 'PlutusV1'
        ? await this.csl.Language.newPlutusV1()
        : ci.redeemer?.type === 'PlutusV2'
        ? await this.csl.Language.newPlutusV2()
        : await this.csl.Language.newPlutusV3()
    const scriptSource = await this.csl.PlutusScriptSource.newRefInput(scriptHash, refInput, language, ci.scriptSize)
    const redeemer = await this.createRedeemer(ci)
    const scriptWitness = await this.csl.PlutusWitness.newWithRefWithoutDatum(scriptSource, redeemer)

    await txBuilder.addPlutusScriptInput(scriptWitness, txIn, val)
  }

  async addScriptInputs(txBuilder: any, contractInputs: ReadonlyArray<ContractInput>) {
    for (const ci of contractInputs) {
      await this.addScriptInput(txBuilder, ci)
    }
  }

  async addCollateral(
    txBuilder: any,
    collateralInput: {txHash: string; outputIndex: number},
    collateralAmount: string,
    changeAddress: string,
  ) {
    const txHash = await this.csl.TransactionHash.fromHex(collateralInput.txHash)
    const txIn = await this.csl.TransactionInput.new(txHash, collateralInput.outputIndex)

    const collateralBuilder = await this.csl.TxInputsBuilder.new()
    const collateralValue = await this.csl.Value.new(await this.csl.BigNum.fromStr(collateralAmount))
    const walletAddr = await this.csl.Address.fromBech32(changeAddress)
    const addressBytes = await walletAddr.toBytes()
    const keyHashBytes = addressBytes.slice(1, 29)
    const keyHash = await this.csl.Ed25519KeyHash.fromBytes(keyHashBytes)

    await collateralBuilder.addKeyInput(keyHash, txIn, collateralValue)
    await txBuilder.setCollateral(collateralBuilder)
  }

  calculateLinearFee(txSize: number): BigNumber {
    const feeCoefficient = new BigNumber(this.protocolParams.linearFee.coefficient)
    const feeConstant = new BigNumber(this.protocolParams.linearFee.constant)
    const calculatedFeeBN = feeCoefficient.times(txSize).plus(feeConstant)
    return calculatedFeeBN
  }

  /**
   * Calculate fee that includes:
   * - linear fee based on transaction size
   * - execution unit fee for Plutus redeemers (mem and steps)
   * - reference script fee based on referenced script byte sizes
   *
   * If no `contractInputs` are provided, this falls back to linear fee by size.
   */
  calculateFee(txSize: number, contractInputs?: ReadonlyArray<ContractInput>): BigNumber {
    const linearFee = this.calculateLinearFee(txSize)

    if (!contractInputs || contractInputs.length === 0) return linearFee

    // Helper: ceil((a * num) / den) with integer math
    const ceilMulDiv = (a: BigNumber, num: BigNumber, den: BigNumber): BigNumber => {
      if (a.isZero() || num.isZero()) return new BigNumber(0)
      const numerator = a.times(num)
      const q = numerator.dividedToIntegerBy(den)
      const r = numerator.mod(den)
      return r.isZero() ? q : q.plus(1)
    }

    const memNum = new BigNumber(this.protocolParams.scriptExecutionPrices.memory.numerator)
    const memDen = new BigNumber(this.protocolParams.scriptExecutionPrices.memory.denominator)
    const stepNum = new BigNumber(this.protocolParams.scriptExecutionPrices.cpu.numerator)
    const stepDen = new BigNumber(this.protocolParams.scriptExecutionPrices.cpu.denominator)

    const exUnitsFee = contractInputs.reduce((acc, ci) => {
      const mem = new BigNumber(ci.redeemer?.exUnits?.mem ?? '0')
      const steps = new BigNumber(ci.redeemer?.exUnits?.steps ?? '0')
      const memFee_i = ceilMulDiv(mem, memNum, memDen)
      const stepFee_i = ceilMulDiv(steps, stepNum, stepDen)
      return acc.plus(memFee_i).plus(stepFee_i)
    }, new BigNumber(0))

    const refNum = new BigNumber(this.protocolParams.minFeeReferenceScript.coinsPerByte.numerator)
    const refDen = new BigNumber(this.protocolParams.minFeeReferenceScript.coinsPerByte.denominator)
    const refScriptFee = contractInputs.reduce((acc, ci) => {
      const size = new BigNumber(ci.scriptSize || 0)
      const fee_i = ceilMulDiv(size, refNum, refDen)
      return acc.plus(fee_i)
    }, new BigNumber(0))

    return linearFee.plus(exUnitsFee).plus(refScriptFee)
  }
}
