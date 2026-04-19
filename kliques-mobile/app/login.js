import { Redirect } from 'expo-router';
import { View } from 'react-native';

import KliquesWebView from '../components/KliquesWebView';
import { useRole } from '../hooks/useRole';

export default function LoginScreen() {
  const { role, ready } = useRole();

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#FBF7F2' }} />;
  }

  if (role) {
    return <Redirect href="/(tabs)/mykliques" />;
  }

  return <KliquesWebView path="/login" pullToRefresh={false} />;
}
