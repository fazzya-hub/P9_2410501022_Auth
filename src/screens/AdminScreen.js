import React from 'react';
import { View, Text, Button } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function AdminScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Halaman Admin</Text>
      <Button title="Logout" onPress={() => signOut(auth)} color="red" />
    </View>
  );
}