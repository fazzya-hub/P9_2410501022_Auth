import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { auth } from '../config/firebase';
import { sendEmailVerification, signOut } from 'firebase/auth';

export default function VerificationScreen() {
  const checkStatus = async () => {
    await auth.currentUser.reload(); 
    if (auth.currentUser.emailVerified) {
      Alert.alert("Berhasil", "Akun lo udah aktif!");
    } else {
      Alert.alert("Belum Verif", "Cek lagi Inbox atau folder SPAM lo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifikasi Email Dulu!</Text>
      <Text style={{ marginVertical: 20 }}>Link sudah dikirim ke: {auth.currentUser?.email}</Text>
      <Button title="Gue Udah Klik Link" onPress={checkStatus} color="green" />
      <View style={{ marginVertical: 5 }} />
      <Button title="Kirim Ulang Email" onPress={() => sendEmailVerification(auth.currentUser)} />
      <View style={{ marginVertical: 5 }} />
      <Button title="Logout" onPress={() => signOut(auth)} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold' }
});