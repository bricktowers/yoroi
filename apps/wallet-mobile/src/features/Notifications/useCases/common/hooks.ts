import React from 'react'
import {PermissionsAndroid} from 'react-native'
import {Notifications, Registered, RegistrationError} from 'react-native-notifications'
import {NotificationBackgroundFetchResult} from 'react-native-notifications'

import {notificationManager} from './notification-manager'
import {parseNotificationId} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  Notifications.registerRemoteNotifications()
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
    Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log('Device Token Received', event.deviceToken)
    })
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
      console.error('Failed to register for remote notifications', event)
    })
  }, [enabled])
}
