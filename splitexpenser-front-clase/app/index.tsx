import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";
import Constants from "expo-constants";

export default function Home() {
  const { token, logout } = useContext(AuthContext);
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [groupName, setGroupName] = useState("");
  const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

  const handleGroupList = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Error al cargar grupos");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los grupos");
    }
  };

  useEffect(() => {
    if (token) {
      handleGroupList();
    } else {
      setTimeout(() => {
        router.replace("/login");
      }, 0);
    }
  }, [token]);

  const handleAddGroup = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error("Error al cargar grupos");
      const data = await res.json()
      setGroups([...groups, data])
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo agregar el grupo");
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sus Grupos</Text>

      <TextInput
        placeholder="Nombre del grupo"
        value={groupName}
        onChangeText={setGroupName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button
        onPress={() => { handleAddGroup(groupName) }}
        title="Presionar"
      />
      <View style={styles.listContainer}>
        {groups.map((item, index) => (
          <View key={index} style={styles.listContainer}>
            <TouchableOpacity
              style={styles.groupItem}
              onPress={() => router.push({
                pathname: "/groupdetail/[groupId]",
                params: { groupId: item.id }
              })}
            >
              <Text style={styles.groupText}>{item.name} - {item.id}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Button title="Cerrar sesión" onPress={() => void logout()} />
        <View style={{ marginTop: 10 }}>
          <Button color={"red"} title="Eliminar Cuenta" onPress={() => router.push("/unregister")} />
        </View>
      </View>
    </View>
  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  listContainer: {
    width: '100%',
    marginVertical: 10,
  },
  groupItem: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 8,
  },
  groupText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
  footer: {
    marginTop: 20,
    width: '100%',
  }
})