import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Button, Text, TextInput, View, Alert, Modal } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
    const { login, token } = useContext(AuthContext);
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
    );
}