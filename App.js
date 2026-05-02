import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/config/firebase';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          // Di Firestore: beranda biasa = role "user". Hanya "admin" yang ke Panel Admin.
          let nextRole = 'user';
          if (snap.exists()) {
            const raw = snap.data()?.role;
            nextRole = raw === 'admin' ? 'admin' : 'user';
          }
          setRole(nextRole);
          setUser(currentUser);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.warn('[auth/onAuthStateChanged]', err);
        if (currentUser) {
          setRole('user');
          setUser(currentUser);
        } else {
          setUser(null);
          setRole(null);
        }
      } finally {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  const navKey = useMemo(() => {
    if (!user) return 'guest';
    if (!user.emailVerified) return `verify-${user.uid}`;
    return role === 'admin' ? `admin-${user.uid}` : `home-${user.uid}`;
  }, [user, role]);

  const initialRouteName = useMemo(() => {
    if (!user) return 'Login';
    if (!user.emailVerified) return 'Verification';
    return role === 'admin' ? 'AdminHome' : 'Home';
  }, [user, role]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={navKey}
        initialRouteName={initialRouteName}
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Masuk' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Daftar' }} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Lupa Password' }}
            />
          </>
        ) : !user.emailVerified ? (
          <Stack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{
              title: 'Verifikasi Email',
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
        ) : role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminScreen} options={{ title: 'Panel Admin' }} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Beranda' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
