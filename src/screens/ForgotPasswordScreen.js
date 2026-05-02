import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth'; 
import { auth } from '../config/firebase'; 

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Cek Email", "Link reset password udah dikirim ke inbox/spam kamu!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Email kamu apa?" 
        onChangeText={setEmail} 
        style={styles.input} 
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={{color: 'white'}}>Kirim Link Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, padding: 10 },
  button: { backgroundColor: '#db4437', padding: 15, alignItems: 'center', borderRadius: 10 }
});