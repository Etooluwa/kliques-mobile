import { Share } from 'react-native';

import { clearAuthSession, saveAuthSession } from './auth';
import { registerForPushNotificationsAsync } from './notifications';
import { clearTabBadges, setTabBadges } from './tabBadges';

export const BRIDGE_MESSAGE_TYPES = {
  AUTH_TOKEN: 'AUTH_TOKEN',
  LOGOUT: 'LOGOUT',
  NOTIFICATION_COUNT: 'NOTIFICATION_COUNT',
  HAPTIC: 'HAPTIC',
  SHARE: 'SHARE',
  REQUEST_NOTIFICATION_PERMISSION: 'REQUEST_NOTIFICATION_PERMISSION',
};

export function parseBridgeMessage(rawData) {
  if (!rawData) {
    return null;
  }

  try {
    return JSON.parse(rawData);
  } catch {
    return null;
  }
}

export async function handleBridgeMessage(message, handlers = {}) {
  const { onAuthToken, onLogout, onNotificationCount, onHaptic } = handlers;

  if (!message?.type) {
    return;
  }

  switch (message.type) {
    case BRIDGE_MESSAGE_TYPES.AUTH_TOKEN: {
      const token = message.payload?.token;
      const role = message.payload?.role;

      if (!token || !role) {
        return;
      }

      await saveAuthSession(token, role);
      onAuthToken?.({ token, role });
      break;
    }
    case BRIDGE_MESSAGE_TYPES.LOGOUT:
      await clearAuthSession();
      clearTabBadges();
      onLogout?.();
      break;
    case BRIDGE_MESSAGE_TYPES.NOTIFICATION_COUNT:
      setTabBadges({
        messages: message.payload?.messages,
        notifications:
          message.payload?.notifications ?? message.payload?.count,
      });
      onNotificationCount?.(message.payload ?? {});
      break;
    case BRIDGE_MESSAGE_TYPES.HAPTIC:
      onHaptic?.(message.payload?.style ?? 'light');
      break;
    case BRIDGE_MESSAGE_TYPES.SHARE: {
      const url = message.payload?.url;
      const title = message.payload?.title;

      if (!url) {
        return;
      }

      await Share.share({
        message: title ? `${title} ${url}` : url,
        url,
        title,
      });
      break;
    }
    case BRIDGE_MESSAGE_TYPES.REQUEST_NOTIFICATION_PERMISSION:
      await registerForPushNotificationsAsync();
      break;
    default:
      break;
  }
}

export function createInjectedBridgeScript() {
  return `
    (function() {
      window.KliquesNative = {
        isNative: true,
        postMessage: function(type, payload) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
        },
        requestNotificationPermission: function() {
          this.postMessage('REQUEST_NOTIFICATION_PERMISSION', {});
        },
        haptic: function(style) {
          this.postMessage('HAPTIC', { style: style || 'light' });
        },
        share: function(url, title) {
          this.postMessage('SHARE', { url: url, title: title });
        }
      };
      window.dispatchEvent(new Event('kliques-native-ready'));
    })();
    true;
  `;
}
