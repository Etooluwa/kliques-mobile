import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { BASE_URL, COLORS } from '../constants/config';
import { saveAuthSession } from '../services/auth';
import {
  createInjectedBridgeScript,
  handleBridgeMessage,
  parseBridgeMessage,
} from '../services/bridge';

function addNativeParam(url) {
  if (url.includes('native=1')) {
    return url;
  }

  return `${url}${url.includes('?') ? '&' : '?'}native=1`;
}

function buildUrl(path) {
  return addNativeParam(`${BASE_URL}${path}`);
}

function getUrlHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function isExternalUrl(url) {
  const host = getUrlHost(url);

  if (!host) {
    return false;
  }

  return !['app.mykliques.com', 'mykliques.com'].includes(host);
}

function isDeepLinkUrl(url) {
  const host = getUrlHost(url);

  if (!host) {
    return false;
  }

  return ['app.mykliques.com', 'mykliques.com'].includes(host);
}

async function triggerHaptic(style) {
  switch (style) {
    case 'heavy':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'medium':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    default:
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
  }
}

export default function KliquesWebView({
  path,
  onMessage,
  showLoading = true,
  pullToRefresh = true,
}) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const source = useMemo(() => ({ uri: buildUrl(path) }), [path]);

  const injectNativeMessage = useCallback((type, payload = {}) => {
    const serializedPayload = JSON.stringify(payload);
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent('kliques-native-message', {
        detail: { type: ${JSON.stringify(type)}, payload: ${serializedPayload} }
      }));
      true;
    `);
  }, []);

  const handleRetry = useCallback(() => {
    setIsOffline(false);
    webViewRef.current?.reload();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    webViewRef.current?.reload();
  }, []);

  const handleNavigationStateChange = useCallback((state) => {
    setCanGoBack(state.canGoBack);
    setIsLoading(state.loading);
  }, []);

  const handleShouldStartLoadWithRequest = useCallback((request) => {
    const requestUrl = request.url;

    if (isExternalUrl(requestUrl)) {
      void Linking.openURL(requestUrl);
      return false;
    }

    if (requestUrl.includes('/auth/callback')) {
      try {
        const parsed = Linking.parse(requestUrl);
        const token = parsed.queryParams?.token;
        const role = parsed.queryParams?.role;

        if (token && role) {
          void saveAuthSession(token, role);
          router.replace('/(tabs)/home');
          return false;
        }
      } catch {
        return true;
      }
    }

    if (isDeepLinkUrl(requestUrl) && !requestUrl.startsWith(BASE_URL)) {
      void Linking.openURL(requestUrl);
      return false;
    }

    return true;
  }, []);

  const handleWebMessage = useCallback(
    async (event) => {
      const message = parseBridgeMessage(event.nativeEvent.data);

      await handleBridgeMessage(message, {
        onAuthToken: ({ role }) => {
          injectNativeMessage('AUTH_TOKEN_ACK', { role });
          router.replace('/(tabs)/home');
        },
        onLogout: () => {
          router.replace('/login');
        },
        onNotificationCount: ({ count = 0 }) => {
          setNotificationCount(count);
        },
        onHaptic: async (style) => {
          await triggerHaptic(style);
        },
      });

      onMessage?.(message, {
        notificationCount,
        injectNativeMessage,
      });
    },
    [injectNativeMessage, notificationCount, onMessage]
  );

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) {
        return false;
      }

      webViewRef.current?.goBack();
      return true;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  if (isOffline) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          paddingHorizontal: 24,
          paddingTop: insets.top,
          backgroundColor: COLORS.base,
        }}
      >
        <StatusBar style="dark" />
        <Text
          selectable
          style={{
            color: COLORS.ink,
            fontSize: 22,
            fontWeight: '700',
          }}
        >
          You're offline
        </Text>
        <Text
          selectable
          style={{
            color: COLORS.muted,
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          Check your connection and try loading Kliques again.
        </Text>
        <Pressable
          onPress={handleRetry}
          style={{
            minWidth: 140,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderRadius: 999,
            backgroundColor: COLORS.accent,
          }}
        >
          <Text selectable style={{ color: '#FFFFFF', fontWeight: '700' }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: COLORS.base }}>
      <StatusBar style="dark" />
      <WebView
        ref={webViewRef}
        source={source}
        originWhitelist={['*']}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled={pullToRefresh}
        injectedJavaScriptBeforeContentLoaded={createInjectedBridgeScript()}
        onMessage={handleWebMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => {
          setIsLoading(true);
          setIsOffline(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          setRefreshing(false);
        }}
        onError={() => {
          setIsLoading(false);
          setRefreshing(false);
          setIsOffline(true);
        }}
        renderLoading={() =>
          showLoading ? (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.base,
              }}
            >
              <ActivityIndicator size="small" color={COLORS.accent} />
            </View>
          ) : null
        }
        refreshControl={
          pullToRefresh ? (
            <RefreshControl
              refreshing={refreshing || isLoading}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
              progressBackgroundColor={COLORS.base}
            />
          ) : undefined
        }
      />
    </View>
  );
}
