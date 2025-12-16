import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Button, Text, TextInput, View, Alert, Modal, StyleSheet, ScrollView } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native-safe-area-context";


interface Expense {
  id: number;
  desc: string;
  amount: number;
  paid_by: number;
}

export default function GroupDetail() {
  const { token } = useContext(AuthContext);
  const { groupId } = useLocalSearchParams();
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
    if (token && groupId) {
      handleExpensesList();
      console.log(groupId);
    } else {
      setTimeout(() => {
        router.replace("/login");
      }, 0);
    }
  }, [token, groupId]);

  const handleAddExpense = async () => {
    if (!newAmount || !newDescription) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ 
          description: newDescription,
          amount: parseFloat(newAmount)
        })
      });
      if (!res.ok) throw new Error("Error al agregar gasto");
      const data = await res.json();
      handleExpensesList(); 
      setVisibleModal(false);
      setNewAmount("");
      setNewDescription("");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo agregar el gasto");
    }
  };

  const handleEditExpense = async () => {
    if (!newAmount || !newDescription || !currentExpenseId) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses/${currentExpenseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ 
          description: newDescription,
          amount: parseFloat(newAmount)
        })
      });
      if (!res.ok) throw new Error("Error al editar gasto");
      
      
      setExpenses(expenses.map(e => 
        e.id === currentExpenseId 
          ? { ...e, desc: newDescription, amount: parseFloat(newAmount) }
          : e
      ));
      
      setVisibleModal(false);
      setNewAmount("");
      setNewDescription("");
      setCurrentExpenseId(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo editar el gasto");
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/expenses/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!res.ok) throw new Error("Error al borrar gasto");
      
      setExpenses(expenses.filter(e => e.id !== id));
      Alert.alert("Éxito", "Gasto eliminado");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo eliminar el gasto");
    }
  };

  const openModalForAdd = () => {
    setCurrentExpenseId(null);
    setNewAmount("");
    setNewDescription("");
    setVisibleModal(true);
  };

  const openModalForEdit = (expense: Expense) => {
    setCurrentExpenseId(expense.id);
    setNewAmount(expense.amount.toString());
    setNewDescription(expense.desc); 
    setVisibleModal(true);
  };

  const closeModal = () => {
    setVisibleModal(false);
    setNewAmount("");
    setNewDescription("");
    setCurrentExpenseId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi grupo #{groupId}</Text>

      <View style={styles.addButtonContainer}>
        <Button title="Agregar Gasto" onPress={openModalForAdd} />
      </View>

      <ScrollView style={styles.scrollView}>
        {expenses.map((e, index) => (
          <View key={index} style={styles.expenseItem}>
            <Text style={styles.expenseText}>Monto: ${e.amount}</Text>
            <Text style={styles.expenseText}>Descripción: {e.desc}</Text>
            <Text style={styles.expenseText}>Pagado por: {e.paid_by}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Editar" onPress={() => openModalForEdit(e)} />
              <Button title="Borrar" onPress={() => handleDeleteExpense(e.id)} color="#ff3b30" />
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={visibleModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentExpenseId ? `Editar gasto #${currentExpenseId}` : "Agregar nuevo gasto"}
            </Text>
            
            <Text style={styles.label}>Monto:</Text>
            <TextInput
              style={styles.input}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="Ej: 25.50"
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Descripción:</Text>
            <TextInput
              style={styles.input}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Ej: Cena restaurante"
            />
            
            <View style={styles.modalButtons}>
              <Button 
                title={currentExpenseId ? "Guardar" : "Agregar"} 
                onPress={currentExpenseId ? handleEditExpense : handleAddExpense} 
              />
              <View style={styles.buttonSpacer} />
              <Button title="Cancelar" onPress={closeModal} color="#ff3b30" />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Button title="Volver" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButtonContainer: {
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  expenseItem: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  expenseText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#007AFF',
    padding: 12,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalButtons: {
    marginTop: 10,
  },
  buttonSpacer: {
    height: 10,
  },
  footer: {
    marginTop: 20,
  },
});
