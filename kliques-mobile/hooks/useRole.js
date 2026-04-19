import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { ROLE_KEY } from '../constants/config';

export function useRole() {
  const [role, setRole] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(ROLE_KEY).then((val) => {
      setRole(val || null);
      setReady(true);
    });
  }, []);

  return { role, ready };
}
