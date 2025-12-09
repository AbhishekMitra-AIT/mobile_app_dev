import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuth } from './AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: signOut 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={80} color="#007AFF" />
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.email}>{user}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={40} color="#34C759" />
          <Text style={styles.cardTitle}>Authentication Successful</Text>
          <Text style={styles.cardText}>
            You're now logged in and can access all features of the app.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Stats</Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
  },
  welcome: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  email: {
    color: "#007AFF",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  infoTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: "#007AFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#333",
    marginHorizontal: 10,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});