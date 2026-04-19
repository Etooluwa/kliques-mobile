import { View } from 'react-native';
import { Redirect } from 'expo-router';

import KliquesWebView from '../../components/KliquesWebView';
import { useRole } from '../../hooks/useRole';

export default function MessagesScreen() {
  const { role, ready } = useRole();

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#FBF7F2' }} />;
  }

  if (role !== 'client') {
    return <Redirect href="/(tabs)/mykliques" />;
  }

  return <KliquesWebView path="/app/messages" />;
}
