import {toBigInt} from '@yoroi/common'
import {linksCardanoModuleMaker, useLinks} from '@yoroi/links'
import {useTransfer} from '@yoroi/transfer'
import {Balance, Links} from '@yoroi/types'
import * as React from 'react'
import {InteractionManager, Linking} from 'react-native'
import uuid from 'uuid'

import {useModal} from '../../../components/Modal/ModalContext'
import {logger} from '../../../kernel/logger/logger'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../kernel/navigation'
import {YoroiEntry} from '../../../yoroi-wallets/types/yoroi'
import {useBrowser} from '../../Discover/common/BrowserProvider'
import {useNavigateTo as useReviewTxNavigateTo} from '../../ReviewTx/common/hooks/useNavigateTo'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {RequestedAdaPaymentWithLinkScreen} from '../useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen'
import {RequestedBrowserLaunchDappUrlScreen} from '../useCases/RequestedBrowserLaunchDappUrlScreen/RequestedBrowserLaunchDappUrlScreen'
import {RequestedContractInteractionScreen} from '../useCases/RequestedContractInteractionScreen/RequestedContractInteractionScreen'
import {useNavigateTo} from './useNavigationTo'
import {useStrings} from './useStrings'

const heightBreakpoint = 467
export const useLinksRequestAction = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {action, actionFinished} = useLinks()
  const {openModal, closeModal} = useModal()
  const {
    selected: {wallet},
  } = useWalletManager()
  const navigateTo = useNavigateTo()
  const {navigateToTxReview, resetToTxHistory} = useWalletNavigation()
  const {addTab, setTabActive, tabs} = useBrowser()
  const {memoChanged, receiverResolveChanged, amountChanged, reset, linkActionChanged} = useTransfer()
  const reviewTxNavigateTo = useReviewTxNavigateTo()

  const startTransferWithLink = React.useCallback(
    (action: Links.YoroiAction, decimals: number) => {
      logger.debug('useLinksRequestAction: startTransferWithLink', {action, decimals})
      if (action.info.useCase === 'request/ada-with-link') {
        reset()
        try {
          const link = decodeURIComponent(action.info.params.link)
          if (wallet) {
            const parsedCardanoLink = linksCardanoModuleMaker().parse(link)
            if (parsedCardanoLink) {
              const redirectTo = action.info.params.redirectTo
              if (redirectTo != null && redirectTo !== '') linkActionChanged(action)

              const {address: receiver, amount, memo} = parsedCardanoLink.params
              const ptAmount = toBigInt(amount, decimals)
              memoChanged(memo ?? '')
              receiverResolveChanged(receiver ?? '')
              amountChanged({
                quantity: ptAmount,
                info: wallet.portfolioPrimaryTokenInfo,
              })
              closeModal()
              actionFinished()
              navigateTo.startTransfer()
            }
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing Cardano link', {error})
        }
      }
    },
    [
      actionFinished,
      amountChanged,
      closeModal,
      linkActionChanged,
      memoChanged,
      navigateTo,
      receiverResolveChanged,
      reset,
      wallet,
    ],
  )

  const startTransferWithInlineDatum = React.useCallback(
    (action: Links.YoroiAction) => {
      logger.debug('useLinksRequestAction: startTransferWithInlineDatum', {action})
      if (action.info.useCase === 'request/ada') {
        reset()
        try {
          if (wallet) {
            const params = action.info.params

            const redirectTo = params.redirectTo
            if (redirectTo != null) linkActionChanged(action)

            // map params.output to YoroiEntry
            const outputs: YoroiEntry[] = params.targets.map((output) => {
              const amounts: Balance.Amounts = {}
              output.amounts.forEach((amount: {tokenId: string; quantity: string}) => {
                const tokenId = (() => {
                  if (amount.tokenId === '.' || amount.tokenId === '' || amount.tokenId === 'lovelace') {
                    return '.'
                  }
                  return amount.tokenId
                })()
                amounts[tokenId] = amount.quantity as Balance.Quantity
              })
              return {
                address: output.receiver,
                amounts,
                datum: output.datum != null && output.datum !== '' ? {data: output.datum} : undefined,
              }
            })

            wallet
              .createUnsignedContractLockTx({
                entries: outputs,
                addressMode: 'multiple',
                metadata: [],
              })
              .then((signedTx) => {
                closeModal()
                actionFinished()

                navigateToTxReview({
                  cbor: signedTx.cborHex,
                  onSuccess: () => {
                    if (redirectTo != null) {
                      // Ensure the review screen is closed before any external navigation
                      resetToTxHistory()
                      try {
                        Linking.openURL(redirectTo + '?txid=' + signedTx.txId)
                      } catch (error) {
                        logger.error('useLinksRequestAction: error opening redirect URL', {error, redirectTo})
                      }
                    } else {
                      // If no redirectTo, navigate to submitted transaction screen
                      reviewTxNavigateTo.showSubmittedTxScreen()
                    }
                  },
                  onError: () => {
                    logger.error('useLinksRequestAction: transaction failed')
                  },
                })
              })
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing transfer request', {error})
        }
      }
    },
    [
      actionFinished,
      closeModal,
      linkActionChanged,
      reset,
      wallet,
      navigateToTxReview,
      resetToTxHistory,
      reviewTxNavigateTo,
    ],
  )

  const startContractSpend = React.useCallback(
    (action: Links.YoroiAction) => {
      logger.debug('useLinksRequestAction: startContractSpend', {action})
      if (action.info.useCase === 'request/contract-spend') {
        reset()
        try {
          if (wallet) {
            const redirectTo = action.info.params.redirectTo
            if (redirectTo != null) linkActionChanged(action)

            wallet
              .createUnsignedContractSpendTx({
                contractSpendParams: action.info.params,
                addressMode: 'multiple',
                metadata: [],
              })
              .then((signedTx) => {
                closeModal()
                actionFinished()

                navigateToTxReview({
                  cbor: signedTx.cborHex,
                  onSuccess: () => {
                    if (redirectTo != null) {
                      // Ensure the review screen is closed before any external navigation
                      resetToTxHistory()
                      try {
                        Linking.openURL(redirectTo + '?txid=' + signedTx.txId)
                      } catch (error) {
                        logger.error('useLinksRequestAction: error opening redirect URL', {error, redirectTo})
                      }
                    } else {
                      // If no redirectTo, navigate to submitted transaction screen
                      reviewTxNavigateTo.showSubmittedTxScreen()
                    }
                  },
                  onError: () => {
                    logger.error('useLinksRequestAction: transaction failed')
                  },
                })
              })
          }
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing transfer request', {error})
        }
      }
    },
    [
      actionFinished,
      closeModal,
      linkActionChanged,
      reset,
      wallet,
      navigateToTxReview,
      resetToTxHistory,
      reviewTxNavigateTo,
    ],
  )

  const openRequestedPaymentAda = React.useCallback(
    ({params, isTrusted}: {params: Links.TransferRequestAdaParams; isTrusted: boolean}) => {
      const title = isTrusted ? strings.trustedPaymentRequestedTitle : strings.untrustedPaymentRequestedTitle
      const handleOnContinue = () =>
        startTransferWithInlineDatum({
          info: {
            version: 1,
            feature: 'transfer',
            useCase: 'request/ada',
            params,
          },
          isTrusted,
        })

      const content = (
        <RequestedAdaPaymentWithLinkScreen
          onContinue={handleOnContinue}
          message={params.message ?? ''}
          isTrusted={isTrusted}
        />
      )

      openModal({title: title, content: content, height: heightBreakpoint})
    },
    [
      strings.trustedPaymentRequestedTitle,
      strings.untrustedPaymentRequestedTitle,
      startTransferWithInlineDatum,
      openModal,
    ],
  )

  const openRequestedPaymentAdaWithLink = React.useCallback(
    ({params, isTrusted}: {params: Links.TransferRequestAdaWithLinkParams; isTrusted: boolean}, decimals: number) => {
      const title = isTrusted ? strings.trustedPaymentRequestedTitle : strings.untrustedPaymentRequestedTitle
      const handleOnContinue = () =>
        startTransferWithLink(
          {
            info: {
              version: 1,
              feature: 'transfer',
              useCase: 'request/ada-with-link',
              params,
            },
            isTrusted,
          },
          decimals,
        )

      const content = (
        <RequestedAdaPaymentWithLinkScreen
          onContinue={handleOnContinue}
          message={params.message ?? ''}
          isTrusted={isTrusted}
        />
      )

      openModal({title: title, content: content, height: heightBreakpoint})
    },
    [strings.trustedPaymentRequestedTitle, strings.untrustedPaymentRequestedTitle, startTransferWithLink, openModal],
  )

  const openRequestedContractInteraction = React.useCallback(
    ({params, isTrusted}: {params: Links.ContractSpendParams; isTrusted: boolean}) => {
      const title = isTrusted ? strings.trustedContractSpendTitle : strings.untrustedContractSpendTitle
      const handleOnContinue = () =>
        startContractSpend({
          info: {
            version: 1,
            feature: 'transfer',
            useCase: 'request/contract-spend',
            params,
          },
          isTrusted,
        })

      const content = (
        <RequestedContractInteractionScreen
          onContinue={handleOnContinue}
          message={params.message ?? ''}
          isTrusted={isTrusted}
        />
      )

      openModal({title: title, content: content, height: heightBreakpoint})
    },
    [strings.trustedContractSpendTitle, strings.untrustedContractSpendTitle, startContractSpend, openModal],
  )

  const launchDappUrl = React.useCallback(
    (action: Links.YoroiAction) => {
      logger.debug('useLinksRequestAction: launchDappUrl', {action})
      if (action.info.useCase === 'launch') {
        try {
          const dappUrl = decodeURIComponent(action.info.params.dappUrl)
          const redirectTo = action.info.params.redirectTo
          if (redirectTo != null) linkActionChanged(action)

          logger.debug('useLinksRequestAction: launchDappUrl', {dappUrl})
          track.discoverConnectedBottomSheetOpenDAppClicked()

          const id = uuid.v4()
          addTab(dappUrl, id)
          setTabActive(tabs.length)

          closeModal()
          actionFinished()
          navigateTo.launchDappUrl()
        } catch (error) {
          // TODO: revisit it should display an alert
          closeModal()
          actionFinished()
          logger.error('Error parsing Yoroi link', {error})
        }
      }
    },
    [actionFinished, addTab, closeModal, linkActionChanged, navigateTo, setTabActive, tabs, track],
  )

  const openRequestedBrowserLaunchDappUrl = React.useCallback(
    ({params, isTrusted}: {params: Links.BrowserLaunchDappUrlParams; isTrusted: boolean}) => {
      const title = isTrusted ? strings.trustedBrowserLaunchDappUrlTitle : strings.untrustedBrowserLaunchDappUrlTitle
      const handleOnContinue = () =>
        launchDappUrl({
          info: {
            version: 1,
            feature: 'browser',
            useCase: 'launch',
            params,
          },
          isTrusted,
        })

      const content = (
        <RequestedBrowserLaunchDappUrlScreen onContinue={handleOnContinue} params={params} isTrusted={isTrusted} />
      )

      openModal({title: title, content: content, height: heightBreakpoint})
    },
    [launchDappUrl, openModal, strings.trustedBrowserLaunchDappUrlTitle, strings.untrustedBrowserLaunchDappUrlTitle],
  )

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (wallet != null && action != null) {
        switch (action.info.useCase) {
          case 'request/ada':
            openRequestedPaymentAda({params: action.info.params, isTrusted: action.isTrusted})
            break
          case 'request/ada-with-link':
            openRequestedPaymentAdaWithLink(
              {params: action.info.params, isTrusted: action.isTrusted},
              wallet.portfolioPrimaryTokenInfo.decimals,
            )
            break
          case 'request/contract-spend':
            openRequestedContractInteraction({params: action.info.params, isTrusted: action.isTrusted})
            break
          case 'launch':
            openRequestedBrowserLaunchDappUrl({
              params: action.info.params,
              isTrusted: action.isTrusted,
            })
            break
          default:
            logger.error(new Error(`useLinksRequestAction: unknown useCase: ${action?.info.useCase}`))
            break
        }
      }
    })
  }, [
    action,
    openRequestedBrowserLaunchDappUrl,
    openRequestedPaymentAda,
    openRequestedPaymentAdaWithLink,
    openRequestedContractInteraction,
    wallet,
  ])
}
