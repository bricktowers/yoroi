import messaging from '@react-native-firebase/messaging'
import {isRecord, isString} from '@yoroi/common'
import {createTypeGuardFromSchema, isKeyOf} from '@yoroi/common/src'
import React from 'react'
import {PermissionsAndroid} from 'react-native'
import {NotificationBackgroundFetchResult, Notifications} from 'react-native-notifications'
import {z} from 'zod'

import {notificationManager} from './notification-manager'
import {parseNotificationId, sendNotification} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  Notifications.events().registerNotificationReceivedForeground((_notification, completion) => {
    completion({alert: true, sound: true, badge: true})
  })

  Notifications.events().registerNotificationReceivedBackground((_notification, completion) => {
    completion(NotificationBackgroundFetchResult.NEW_DATA)
  })

  Notifications.events().registerNotificationOpened((notification, completion) => {
    const payloadId = notification.identifier || notification.payload.id
    const id = parseNotificationId(payloadId)
    notificationManager.events.markAsRead(id)
    completion()
  })

  notificationManager.hydrate()

  return () => {
    notificationManager.destroy()
  }
}

export const useInitNotifications = ({enabled}: {enabled: boolean}) => {
  React.useEffect(() => (enabled ? init() : undefined), [enabled])
  useTransactionReceivedNotifications({enabled})
  usePrimaryTokenPriceChangedNotification({enabled})
  useRewardsUpdatedNotifications({enabled})
  usePushNotifications({enabled})
}

const usePushNotifications = ({enabled}: {enabled: boolean}) => {
  React.useEffect(() => {
    if (!enabled) return
    Notifications.registerRemoteNotifications({})
  }, [enabled])
}

messaging().setBackgroundMessageHandler((remoteMessage) => {
  const data = remoteMessage.data as unknown
  if (!isRecord(data) || !isKeyOf('custom', data) || !isString(data.custom)) return Promise.resolve()

  try {
    const custom = JSON.parse(data.custom) as unknown
    if (!isValidNotificationData(custom)) return Promise.resolve()
    sendNotification({title: custom.title, id: 123, body: custom.body})
  } catch (e) {
    console.error(e)
  }

  return Promise.resolve()
})

const isValidNotificationData = createTypeGuardFromSchema(
  z.object({
    title: z.string(),
    body: z.string(),
  }),
)
