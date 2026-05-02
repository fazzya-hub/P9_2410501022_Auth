import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { onAuthStateChanged, reload, signOut } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../config/firebase';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileVersion, setProfileVersion] = useState(0);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return false;
    await reload(auth.currentUser);
    setProfileVersion((v) => v + 1);
    return auth.currentUser.emailVerified;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !auth.currentUser) return;
      reload(auth.currentUser)
        .then(() => setProfileVersion((v) => v + 1))
        .catch(() => {});
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      try {
        if (u) {
          const token = await u.getIdToken();
          await SecureStore.setItemAsync('user_token', token);
          await SecureStore.setItemAsync(
            'user_profile',
            JSON.stringify({
              displayName: u.displayName ?? '',
              photoURL: u.photoURL ?? '',
              email: u.email ?? '',
            }),
          );
        } else {
          await SecureStore.deleteItemAsync('user_token');
          await SecureStore.deleteItemAsync('user_profile');
        }
      } catch (_) {
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const logout = () => signOut(auth);

  const profile = useMemo(() => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }, [user, profileVersion]);

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refreshUser, profileVersion, profile }}
    >
      {children}
    </AuthContext.Provider>
  );
}