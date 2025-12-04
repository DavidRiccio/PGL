import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function logout() {
  const router = useRouter();
  const { token, unregister } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setTimeout(() => router.replace("/login"), 0);
    }
  }, [token]);

  if (!token) return null;

  const handleUnregister = async () => {
    const res = await unregister(username, password);
    if (res.access_token) {
      router.replace("/");
    } else {
      setError(res.msg || "Login fallido");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      
      <View style={{ marginBottom: 10 }}>
        <Button color={"red"} title="Eliminar cuenta" onPress={handleUnregister} />
      </View>
      
      <Button title="Volver a inicio" onPress={() => router.push("/")} />
    </View>
  );
}