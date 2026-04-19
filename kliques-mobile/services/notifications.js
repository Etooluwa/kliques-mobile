import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { getStoredPushToken, savePushToken } from './auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  const existingToken = await getStoredPushToken();
  if (existingToken) {
    return existingToken;
  }

  const { status: currentStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = currentStatus;

  if (currentStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const response = await Notifications.getExpoPushTokenAsync({ projectId });
  await savePushToken(response.data);
  return response.data;
}
