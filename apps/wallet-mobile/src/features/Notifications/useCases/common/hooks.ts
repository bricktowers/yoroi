import React from 'react'
import {PermissionsAndroid} from 'react-native'
import {Notifications, Registered, RegistrationError} from 'react-native-notifications'
import {NotificationBackgroundFetchResult} from 'react-native-notifications'
import messaging from '@react-native-firebase/messaging'

import {notificationManager} from './notification-manager'
import {displayNotificationEvent, parseNotificationId, sendNotification} from './notifications'
import {usePrimaryTokenPriceChangedNotification} from './primary-token-price-changed-notification'
import {useRewardsUpdatedNotifications} from './rewards-updated-notification'
import {useTransactionReceivedNotifications} from './transaction-received-notification'

let initialized = false

const init = () => {
  if (initialized) return
  initialized = true
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  Notifications.events().registerNotificationReceivedForeground((_notification, completion) => {
    console.log('Notification received in foreground')
    completion({alert: true, sound: true, badge: true})
  })

  Notifications.events().registerNotificationReceivedBackground((_notification, completion) => {
    console.log('Notification received in background')
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
  console.log('usePushNotifications', enabled)
  React.useEffect(() => {
    if (!enabled) return
    // Notifications.getInitialNotification().then((notification) => {
    //   console.log('Initial notification', notification)
    // })
    //
    // Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
    //   console.log('NOTIFICATION PUSH: User denied remote notifications')
    // })
    // Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
    //   // TODO: Send the token to my server so it could send back push notifications...
    //   console.log('NOTIFICATION PUSH: Device Token Received', event.deviceToken)
    // })
    // Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
    //   console.log('NOTIFICATION PUSH: Failed to register for remote notifications', event)
    // })
    Notifications.registerRemoteNotifications({})
    const s1 = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage))
    })

    messaging()
      .getToken()
      .then((token) => {
        console.log('FCM Token:', token)
      })

    return () => {
      s1()
    }
  }, [enabled])
}

messaging().setBackgroundMessageHandler(async function (remoteMessage) {
  // self.registration.showNotification('Title', {body: 'Body', icon: '/icon.png'})
  console.log('Message handled in the background!', JSON.stringify(remoteMessage), (self as any).registration)
  sendNotification({title: 'tiiiitle', id: 123, body: 'boooody'})
  // self.registration.showNotification('Title', {body: 'Body', icon: '/icon.png'});
})
