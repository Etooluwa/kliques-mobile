import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import { COLORS } from '../../constants/config';
import { saveAuthSession } from '../../services/auth';

function parseKeyValueString(value) {
  const params = new URLSearchParams(value);
  const entries = {};

  for (const [key, paramValue] of params.entries()) {
    entries[key] = paramValue;
  }

  return entries;
}

function parseAuthCallbackUrl(rawUrl) {
  if (!rawUrl) {
    return {
      fullUrl: null,
      queryParams: {},
      hashParams: {},
      allParams: {},
    };
  }

  const [beforeHash, hash = ''] = rawUrl.split('#');
  const queryString = beforeHash.includes('?') ? beforeHash.split('?')[1] : '';

  const queryParams = parseKeyValueString(queryString);
  const hashParams = parseKeyValueString(hash);

  return {
    fullUrl: rawUrl,
    queryParams,
    hashParams,
    allParams: {
      ...queryParams,
      ...hashParams,
    },
  };
}

export default function AuthCallbackScreen() {
  const url = Linking.useURL();
  const [status, setStatus] = useState('Handling authentication...');

  const parsed = useMemo(() => parseAuthCallbackUrl(url), [url]);

  useEffect(() => {
    async function handleCallback() {
      if (!url) {
        const initialUrl = await Linking.getInitialURL();

        if (!initialUrl) {
          setStatus('No callback URL found.');
          router.replace('/login');
          return;
        }
      }

      const fullUrl = url ?? (await Linking.getInitialURL());
      const result = parseAuthCallbackUrl(fullUrl);
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        signup_role: signupRole,
        role,
        error,
        error_description: errorDescription,
        type,
        signup_name: signupName,
      } = result.allParams;

      console.log('[auth/callback] full URL:', result.fullUrl);
      console.log('[auth/callback] query params:', result.queryParams);
      console.log('[auth/callback] hash params:', result.hashParams);
      console.log('[auth/callback] parsed auth values:', {
        access_token: accessToken ?? null,
        refresh_token: refreshToken ?? null,
        type: type ?? null,
        signup_role: signupRole ?? null,
        signup_name: signupName ?? null,
        error: error ?? null,
        error_description: errorDescription ?? null,
      });

      if (error) {
        setStatus(`Authentication failed: ${errorDescription || error}`);
        router.replace('/login');
        return;
      }

      if (accessToken) {
        await saveAuthSession(
          accessToken,
          signupRole ?? role ?? null,
          refreshToken ?? null
        );
      }

      setStatus('Authentication complete. Redirecting...');
      router.replace('/(tabs)/mykliques');
    }

    void handleCallback();
  }, [url]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 24,
        backgroundColor: COLORS.base,
      }}
    >
      <ActivityIndicator size="small" color={COLORS.accent} />
      <Text
        style={{
          color: COLORS.ink,
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        {status}
      </Text>
      {parsed.fullUrl ? (
        <Text
          selectable
          style={{
            color: COLORS.muted,
            fontSize: 12,
            lineHeight: 18,
            textAlign: 'center',
          }}
        >
          {parsed.fullUrl}
        </Text>
      ) : null}
    </View>
  );
}
