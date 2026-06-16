import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [demandesCoursiers, setDemandesCoursiers] = useState<any[]>([]);
  // ─────────────────────────────
  // Charger les statistiques
  // ─────────────────────────────
  const chargerDashboard = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_dashboard_stats")
        .select("*")
        .single();

      if (error) {
        console.log("Erreur dashboard:", error.message);
        return;
      }

      setStats(data);
      const { data: demandes } = await supabase
        .from("users")
        .select("*")
        .eq("demande_coursier", "en_attente");

      setDemandesCoursiers(demandes || []);
    } catch (err) {
      console.log("Erreur:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  // =====================================================
  // VALIDER
  // =====================================================

  const validerCoursier = async (id: string) => {
    await supabase
      .from("users")
      .update({
        demande_coursier: "valide",
      })
      .eq("id", id);

    chargerDashboard();
    Alert.alert("Succès", "Le coursier a été validé.");
  };

  // =====================================================
  // REFUSER
  // =====================================================

  const refuserCoursier = async (id: string) => {
    await supabase
      .from("users")
      .update({
        demande_coursier: "refuse",
      })
      .eq("id", id);

    chargerDashboard();
    Alert.alert("Refus effectué", "La demande a été refusée.");
  };

  // ─────────────────────────────
  // Chargement initial
  // ─────────────────────────────
  useEffect(() => {
    chargerDashboard();
  }, []);

  // ─────────────────────────────
  // Refresh manuel
  // ─────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    chargerDashboard();
  };

  // ─────────────────────────────
  // Loader
  // ─────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0A2FCC" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>📊 Dashboard Admin</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Total livraisons</Text>
          <Text style={styles.value}>{stats?.total_deliveries ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Livraisons en attente</Text>
          <Text style={styles.value}>{stats?.pending_deliveries ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Livraisons terminées</Text>
          <Text style={styles.value}>{stats?.completed_deliveries ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Revenus totaux</Text>
          <Text style={styles.value}>{stats?.total_revenue ?? 0} FCFA</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Clients</Text>
          <Text style={styles.value}>{stats?.total_clients ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Coursiers</Text>
          <Text style={styles.value}>{stats?.total_riders ?? 0}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Litiges ouverts</Text>
          <Text style={styles.value}>{stats?.open_disputes ?? 0}</Text>
        </View>
        {/* ===================================== */}
        {/* DEMANDES COURSIERS */}
        {/* ===================================== */}

        <Text style={styles.title}>🚴 Demandes Coursiers</Text>

        {demandesCoursiers.length === 0 && (
          <View style={styles.card}>
            <Text>Aucune demande en attente</Text>
          </View>
        )}

        {demandesCoursiers.map((item: any) => (
          <View key={item.id} style={styles.card}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {item.full_name}
            </Text>

            <Text>{item.email}</Text>

            <Text>{item.phone}</Text>

            <TouchableOpacity
              style={styles.validateBtn}
              onPress={() => validerCoursier(item.id)}
            >
              <Text style={styles.btnText}>✅ Valider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => refuserCoursier(item.id)}
            >
              <Text style={styles.btnText}>❌ Refuser</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────
// Styles
// ─────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },

  value: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0A2FCC",
  },
  validateBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  rejectBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
