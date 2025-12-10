import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal, Platform } from "react-native";
import { useAuth } from './AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type MilkRecord = {
  id: string;
  quantity: number;
  date: string;
  timestamp: number;
};

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MilkRecord | null>(null);
  const [costPerLiter, setCostPerLiter] = useState(0);

  useEffect(() => {
    loadRecords();
    loadCostPerLiter();
  }, []);

  // Reload cost when screen comes into focus (e.g., returning from settings)
  useFocusEffect(
    useCallback(() => {
      loadCostPerLiter();
    }, [])
  );

  const loadRecords = async () => {
    try {
      const stored = await AsyncStorage.getItem(`milk_records_${user}`);
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  const loadCostPerLiter = async () => {
    try {
      const stored = await AsyncStorage.getItem(`milk_cost_${user}`);
      if (stored) {
        setCostPerLiter(parseFloat(stored));
      } else {
        // Set default cost to 50 INR per litre
        setCostPerLiter(50);
        await AsyncStorage.setItem(`milk_cost_${user}`, '50');
      }
    } catch (error) {
      console.error('Failed to load cost:', error);
      setCostPerLiter(50); // Fallback to default
    }
  };

  const saveRecords = async (newRecords: MilkRecord[]) => {
    try {
      await AsyncStorage.setItem(`milk_records_${user}`, JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (error) {
      console.error('Failed to save records:', error);
    }
  };

  const addRecord = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const newRecord: MilkRecord = {
      id: Date.now().toString(),
      quantity: parseFloat(quantity),
      date: selectedDate.toLocaleDateString(),
      timestamp: selectedDate.getTime(),
    };

    const updatedRecords = [...records, newRecord].sort((a, b) => b.timestamp - a.timestamp);
    saveRecords(updatedRecords);
    setQuantity('');
    setSelectedDate(new Date());
    setShowAddModal(false);
    Alert.alert('Success', 'Record added successfully');
  };

  const updateRecord = () => {
    if (!editingRecord || !quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const updatedRecords = records.map(r => 
      r.id === editingRecord.id 
        ? { ...r, quantity: parseFloat(quantity), date: selectedDate.toLocaleDateString(), timestamp: selectedDate.getTime() }
        : r
    ).sort((a, b) => b.timestamp - a.timestamp);

    saveRecords(updatedRecords);
    setQuantity('');
    setSelectedDate(new Date());
    setEditingRecord(null);
    setShowEditModal(false);
    Alert.alert('Success', 'Record updated successfully');
  };

  const deleteRecord = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedRecords = records.filter(r => r.id !== id);
            saveRecords(updatedRecords);
          }
        },
      ]
    );
  };

  const openEditModal = (record: MilkRecord) => {
    setEditingRecord(record);
    setQuantity(record.quantity.toString());
    setSelectedDate(new Date(record.timestamp));
    setShowEditModal(true);
  };

  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalCost = totalQuantity * costPerLiter;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Milk Tracker</Text>
          <Text style={styles.headerSubtitle}>{user}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="water-outline" size={32} color="#007AFF" />
          <Text style={styles.summaryValue}>{totalQuantity.toFixed(2)}L</Text>
          <Text style={styles.summaryLabel}>Total Milk</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="cash-outline" size={32} color="#34C759" />
          <Text style={styles.summaryValue}>₹{totalCost.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Cost</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="calendar-outline" size={32} color="#FF9500" />
          <Text style={styles.summaryValue}>{records.length}</Text>
          <Text style={styles.summaryLabel}>Records</Text>
        </View>
      </View>

      {/* Records List */}
      <View style={styles.recordsHeader}>
        <Text style={styles.recordsTitle}>Recent Records</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No records yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first entry</Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordInfo}>
                <View style={styles.recordIcon}>
                  <Ionicons name="water" size={24} color="#007AFF" />
                </View>
                <View style={styles.recordDetails}>
                  <Text style={styles.recordQuantity}>{record.quantity.toFixed(2)} Litres</Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                  <Text style={styles.recordCost}>Cost: ₹{(record.quantity * costPerLiter).toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.recordActions}>
                <TouchableOpacity 
                  onPress={() => openEditModal(record)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => deleteRecord(record.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Milk Record</Text>
            
            <Text style={styles.inputLabel}>Quantity (Litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity in litres"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />

            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setQuantity('');
                  setSelectedDate(new Date());
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addRecord}
              >
                <Text style={styles.saveButtonText}>Add Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Milk Record</Text>
            
            <Text style={styles.inputLabel}>Quantity (Litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity in litres"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />

            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#007AFF" />
              <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setQuantity('');
                  setSelectedDate(new Date());
                  setEditingRecord(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={updateRecord}
              >
                <Text style={styles.saveButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  settingsBtn: {
    padding: 8,
  },
  logoutBtn: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  recordsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#444",
    marginTop: 8,
  },
  recordCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  recordInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0a2540",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recordDetails: {
    flex: 1,
  },
  recordQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  recordDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  recordCost: {
    fontSize: 14,
    color: "#34C759",
    marginTop: 4,
  },
  recordActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#262626",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "white",
    borderWidth: 1,
    borderColor: "#333",
  },
  dateButton: {
    backgroundColor: "#262626",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  dateButtonText: {
    fontSize: 16,
    color: "white",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#262626",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});