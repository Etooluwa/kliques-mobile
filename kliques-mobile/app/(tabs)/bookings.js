import { View } from 'react-native';

import KliquesWebView from '../../components/KliquesWebView';
import { useRole } from '../../hooks/useRole';

export default function BookingsScreen() {
  const { role, ready } = useRole();

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#FBF7F2' }} />;
  }

  const path =
    role === 'provider' ? '/provider/appointments' : '/app/bookings';

  return <KliquesWebView path={path} />;
}
