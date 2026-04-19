import { Redirect, Tabs } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabIcon from '../../components/TabIcon';
import {
  CLIENT_TABS,
  COLORS,
  PROVIDER_TABS,
  ROLE_KEY,
} from '../../constants/config';
import { useTabBadges } from '../../services/tabBadges';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const badges = useTabBadges();
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    SecureStore.getItemAsync(ROLE_KEY).then((storedRole) => {
      if (!active) {
        return;
      }

      setRole(storedRole || null);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: COLORS.base }} />;
  }

  if (!role) {
    return <Redirect href="/login" />;
  }

  const tabs = role === 'provider' ? PROVIDER_TABS : CLIENT_TABS;
  const hiddenTabs =
    role === 'provider' ? ['messages', 'notifications'] : ['home', 'services'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.faded,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(140,106,100,0.12)',
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarBadge: tab.badgeKey ? badges[tab.badgeKey] : undefined,
            tabBarIcon: ({ color }) => (
              <TabIcon name={tab.icon} color={color} size={22} />
            ),
          }}
        />
      ))}
      {hiddenTabs.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            href: null,
          }}
        />
      ))}
    </Tabs>
  );
}
