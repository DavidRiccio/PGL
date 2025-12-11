import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View, Alert, Modal } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GroupDetail(groupId: number) {
    const { token } = useContext(AuthContext);
    const [currentExpenseId,setCurrentExpenseId] = useState<string|null>(null);
    const [newAmount,setNewAmount] = useState("0");
    const [newDescription,setNewDescription] = useState("");
    const [visibleModal, setVisibleModal] = useState(false);
    
    const [expenses, setExpenses] = useState([
        {
            id: "1",
            desc: "description 1",
            amount: "10",
            paid_by: "e.paid_by",

        }, {
            id: "2",
            desc: "description 2",
            amount: "10",
            paid_by: "e.paid_by",

        }, {
            id: "3",
            desc: "description 3",
            amount: "10",
            paid_by: "e.paid_by",

        },
    ]);
    const router = useRouter();
    const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";
    
     const handleExpensesList = async () => {
        try {
          const res = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          });
          if (!res.ok) throw new Error("Error al cargar gastos");
          const data = await res.json();
          setExpenses(data);
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "No se pudieron cargar los gastos");
        }
      };

        useEffect(() => {
          if (token) {
            handleExpensesList();
            console.log(groupId);
            
          } else {
            setTimeout(() => {
              router.replace("/login");
            }, 0);
          }
        }, [token]);

    const handleDelete = (id: string) => {
        console.log(`Borro el id : ${id}`);
        for (let i = 0; i < expenses.length; i++) {
            console.log(expenses[i]);
            if (expenses[i].id == id) {
                expenses.splice(i, 1);
                setExpenses([...expenses]);
            }
        }
        Alert.alert("Voy a borrar");
    };

    const handleAddExpense = async (name: string) => {
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
          setExpenses([...expenses,data])
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "No se pudo agregar el grupo");
        }
      };

    const handleEdit = () => {
        setVisibleModal(false);
        if (currentExpenseId==null) {
            return;
        }
        handleDelete(currentExpenseId);
        const newExpense ={
            id:currentExpenseId,
            desc:newDescription,
            amount: newAmount,
            paid_by:"e.paid_by"
        }
        const sortExpenses = [...expenses, newExpense].sort((a,b)=>Number(a.id)-Number(b.id));
        setExpenses(sortExpenses);
        Alert.alert("Voy a edit");
    };

    const openModal = (id: string) => {
        setCurrentExpenseId(id);
        setVisibleModal(true);
    };

    return (
        <SafeAreaView>

        <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <Text>Mi grupo</Text>
            {expenses.map((e, index) => (
                <View key={e.id}>
                    <TextInput keyboardType="number-pad" >{e.amount}</TextInput>
                    <TextInput>{e.desc}</TextInput>
                    <Button title="Actualizar" onPress={() => openModal(e.id)} />
                    <Button title="Borrar" onPress={() => handleDelete(e.id)} />
                </View>
            ))}
            <Modal visible={visibleModal}>
                <Text>Editando expense #{currentExpenseId}</Text>
                <TextInput value={newAmount} onChangeText={(text) => setNewAmount(text)}></TextInput>
                <TextInput value={newDescription} onChangeText={(text) => setNewDescription(text)}></TextInput>
                <Button title="Guardar" onPress={handleEdit}></Button>
                <Button title="Cancelar" onPress={() => setVisibleModal(false)}></Button>
            </Modal>
            <Button title="Volver a mis grupos" onPress={() => router.replace("/")} />
        </View>
                </SafeAreaView>

    );
}