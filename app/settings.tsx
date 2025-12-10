import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { useAuth } from './AuthContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [costPerLiter, setCostPerLiter] = useState('50');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedCost = await AsyncStorage.getItem(`milk_cost_${user}`);
      
      if (storedCost) {
        setCostPerLiter(storedCost);
      } else {
        // Set default cost to 50 INR per litre
        setCostPerLiter('50');
        await AsyncStorage.setItem(`milk_cost_${user}`, '50');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveCost = async () => {
    const cost = parseFloat(costPerLiter);
    
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }

    try {
      await AsyncStorage.setItem(`milk_cost_${user}`, costPerLiter);
      setIsEditing(false);
      Alert.alert('Success', 'Cost updated successfully! Changes will reflect on the dashboard.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save cost');
    }
  };

  const changeUnit = async (newUnit: 'liter' | 'gallon') => {
    try {
      await AsyncStorage.setItem(`milk_unit_${user}`, newUnit);
      setUnit(newUnit);
      
      // Convert cost when switching units
      // 1 gallon = 3.78541 liters
      const currentCost = parseFloat(costPerLiter);
      if (newUnit === 'gallon' && unit === 'liter') {
        setCostPerLiter((currentCost * 3.78541).toFixed(2));
      } else if (newUnit === 'liter' && unit === 'gallon') {
        setCostPerLiter((currentCost / 3.78541).toFixed(2));
      }
    } catch (error) {
      console.error('Failed to change unit:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>
      
      {/* Account Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user}</Text>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pricetag-outline" size={24} color="#34C759" />
          <Text style={styles.sectionTitle}>Pricing</Text>
        </View>

        {/* Cost Input */}
        <View style={styles.costContainer}>
          <View style={styles.costHeader}>
            <Text style={styles.label}>Cost per Litre</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.costInput}
                  value={costPerLiter}
                  onChangeText={setCostPerLiter}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => {
                    setIsEditing(false);
                    loadSettings();
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn}
                  onPress={saveCost}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.costDisplay}>
              <Text style={styles.costValue}>₹{parseFloat(costPerLiter).toFixed(2)}</Text>
              <Text style={styles.costUnit}>per litre</Text>
            </View>
          )}
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={24} color="#FF9500" />
          <Text style={styles.sectionTitle}>App Information</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Developer</Text>
          <Text style={styles.value}>Milk Tracker Team</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#999',
  },
  value: {
    fontSize: 16,
    color: 'white',
  },
  costContainer: {
    marginTop: 8,
  },
  costHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costDisplay: {
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  costValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
  },
  costUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editContainer: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  currencySymbol: {
    fontSize: 24,
    color: 'white',
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 24,
    color: 'white',
    paddingVertical: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#262626',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});