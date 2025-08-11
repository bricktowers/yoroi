/* eslint-disable @typescript-eslint/no-explicit-any */
import {Balance} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

import {YoroiEntry} from '../../types/yoroi'
import {Cardano} from '../../wallets'
import {CardanoTypes} from '../types'
import {YoroiWallet} from '../types'
import {wrappedCsl} from '../wrappedCsl'
import {ContractInput, CslHelper, WalletInput} from './cslHelper'

// Ideally this would be inside YoroiLib, but it's not open-source
export const createUnsignedContractLockTx = async ({
  wallet,
  changeAddress,
  walletInputs,
  entries,
  metadata,
}: {
  wallet: YoroiWallet
  changeAddress: string
  walletInputs: ReadonlyArray<WalletInput>
  entries: YoroiEntry[]
  metadata?: Array<CardanoTypes.TxMetadata>
}): Promise<{
  cborHex: string
  txId: string
}> => {
  const {csl, release} = wrappedCsl()
  const protocolParams = wallet.protocolParams
  const cslHelper = new CslHelper(csl, protocolParams)

  try {
    const config = await cslHelper.createTxBuilderConfig()
    const estimationBuilder = await csl.TransactionBuilder.new(config)
    await cslHelper.addInputs(estimationBuilder, walletInputs, changeAddress)
    await cslHelper.addOutputs(estimationBuilder, entries)
    await estimationBuilder.setFee(await csl.BigNum.fromStr('1000000'))
    await estimationBuilder.addChangeIfNeeded(await csl.Address.fromBech32(changeAddress))
    const estimationTxBody = await estimationBuilder.build()
    const estimationWitnessSet = await cslHelper.createMockVkeyWitnesses(estimationTxBody, wallet)
    const auxiliaryData = await cslHelper.createAuxiliaryData(metadata)
    const estimationTx = await csl.Transaction.new(estimationTxBody, estimationWitnessSet, auxiliaryData)
    const estimationTxBytes = await estimationTx.toBytes()

    const calculatedFee = cslHelper.calculateFee(estimationTxBytes.length)

    const finalBuilder = await csl.TransactionBuilder.new(config)
    await cslHelper.addInputs(finalBuilder, walletInputs, changeAddress)
    await cslHelper.addOutputs(finalBuilder, entries)
    await finalBuilder.setFee(await csl.BigNum.fromStr(calculatedFee.toString()))
    await finalBuilder.addChangeIfNeeded(await csl.Address.fromBech32(changeAddress))
    const finalTxBody = await finalBuilder.build()
    const finalTx = await csl.Transaction.new(finalTxBody, await csl.TransactionWitnessSet.new(), auxiliaryData)
    const cborHex = await finalTx.toHex()
    const txId = await Cardano.calculateTxId(cborHex, 'hex')

    return {cborHex, txId}
  } catch (error) {
    throw new Error(`CBOR transaction building failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    release()
  }
}

export const createUnsignedContractSpendTx = async ({
  wallet,
  absSlotNumber,
  changeAddress,
  walletInputs,
  contractInputs,
  collateralInput,
  entries,
  metadata,
}: {
  wallet: YoroiWallet
  absSlotNumber: number
  changeAddress: string
  walletInputs: ReadonlyArray<WalletInput>
  contractInputs: ReadonlyArray<ContractInput>
  collateralInput: {txHash: string; outputIndex: number}
  entries: YoroiEntry[]
  metadata?: Array<CardanoTypes.TxMetadata>
}): Promise<{
  cborHex: string
  txId: string
}> => {
  const {csl, release} = wrappedCsl()
  const cslHelper = new CslHelper(csl, wallet.protocolParams)

  try {
    const inputAmount = contractInputs.reduce((acc, ci) => acc.plus(new BigNumber(ci.amount)), new BigNumber(0))

    const walletAddresses = new Set<string>([...wallet.internalAddresses, ...wallet.externalAddresses, changeAddress])
    const redeemers = await cslHelper.createRedeemers(contractInputs)
    const costModels = await cslHelper.createCostModels()
    const scriptDataHash = await csl.hashScriptData(redeemers, costModels, undefined) // Use undefined for script level datums (we use inline datums)
    const auxiliaryData = await cslHelper.createAuxiliaryData(metadata)

    const initialFee = '1000000'
    const config = await cslHelper.createTxBuilderConfig()
    const estimationBuilder = await csl.TransactionBuilder.new(config)
    await cslHelper.addScriptInputs(estimationBuilder, contractInputs)
    await cslHelper.addInputs(estimationBuilder, walletInputs, changeAddress)
    const estimationAdjustedEntries = adjustEntriesForFee(entries, new BigNumber(initialFee), walletAddresses)
    await cslHelper.addOutputs(estimationBuilder, estimationAdjustedEntries)
    await cslHelper.addCollateral(estimationBuilder, collateralInput, '5000000', changeAddress)
    await estimationBuilder.setScriptDataHash(scriptDataHash)
    await estimationBuilder.setValidityStartInterval(absSlotNumber)
    await estimationBuilder.setFee(await csl.BigNum.fromStr(initialFee))
    await estimationBuilder.addChangeIfNeeded(await csl.Address.fromBech32(changeAddress))
    const estimationTxBody = await estimationBuilder.build()
    const estimationWitnessSet = await cslHelper.createMockVkeyWitnesses(estimationTxBody, wallet)
    await estimationWitnessSet.setRedeemers(redeemers)
    const estimationTx = await csl.Transaction.new(estimationTxBody, estimationWitnessSet, auxiliaryData)
    const estimationTxBytes = await estimationTx.toBytes()
    const calculatedFee = cslHelper.calculateFee(estimationTxBytes.length, contractInputs)

    const minCollateral = calculatedFee
      .times(new BigNumber(wallet.protocolParams.collateralPercentage))
      .dividedToIntegerBy(100)
    const finalOutputAmount = inputAmount.minus(calculatedFee)
    if (finalOutputAmount.lt(0)) {
      throw new Error('Script input amount is insufficient to cover the fee')
    }

    const finalBuilder = await csl.TransactionBuilder.new(config)
    await cslHelper.addScriptInputs(finalBuilder, contractInputs)
    await cslHelper.addInputs(finalBuilder, walletInputs, changeAddress)
    const finalAdjustedEntries = adjustEntriesForFee(entries, calculatedFee, walletAddresses)
    await cslHelper.addOutputs(finalBuilder, finalAdjustedEntries)
    await finalBuilder.setScriptDataHash(scriptDataHash)
    await cslHelper.addCollateral(finalBuilder, collateralInput, minCollateral.toString(), changeAddress)
    await finalBuilder.setValidityStartInterval(absSlotNumber - 1_640_000)
    await finalBuilder.setFee(await csl.BigNum.fromStr(calculatedFee.toString()))
    const finalTxBody = await finalBuilder.build()

    const finalTxWitnessSet = await csl.TransactionWitnessSet.new()
    await finalTxWitnessSet.setRedeemers(redeemers)
    const finalTx = await csl.Transaction.new(finalTxBody, finalTxWitnessSet, auxiliaryData)
    const cborHex = await finalTx.toHex()
    const txId = await Cardano.calculateTxId(cborHex, 'hex')

    return {cborHex, txId}
  } catch (error) {
    throw new Error(
      `Contract spend transaction building failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  } finally {
    release()
  }
}

// Adjust one entry that goes to our address by subtracting the fee from its primary token amount
const adjustEntriesForFee = (entries: YoroiEntry[], fee: BigNumber, ourAddresses: Set<string>): YoroiEntry[] => {
  const indexToAdjust = entries.findIndex((e) => ourAddresses.has(e.address))
  if (indexToAdjust < 0) return entries

  const currentAmount = new BigNumber(entries[indexToAdjust].amounts['.'] ?? '0')
  const adjustedAmount = currentAmount.minus(fee)
  if (adjustedAmount.lt(0)) throw new Error('Output amount to our address is insufficient to cover the fee')

  const adjustedEntry: YoroiEntry = {
    ...entries[indexToAdjust],
    amounts: {
      ...entries[indexToAdjust].amounts,
      '.': adjustedAmount.toFixed(0) as unknown as Balance.Quantity,
    },
  }

  const result = [...entries]
  result[indexToAdjust] = adjustedEntry
  return result
}
