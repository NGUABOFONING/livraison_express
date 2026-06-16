import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LivraisonConfirmerScreen() {
  const { deliveryId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState(null);
  const [payment, setPayment] = useState(null);
  const [stars, setStars] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 📦 livraison
      const { data: deliveryData } = await supabase
        .from("deliveries")
        .select("*")
        .eq("id", deliveryId)
        .single();

      // 💳 paiement
      const { data: paymentData } = await supabase
        .from("payments")
        .select("*")
        .eq("delivery_id", deliveryId)
        .single();

      setDelivery(deliveryData);
      setPayment(paymentData);
      setLoading(false);
    };

    if (deliveryId) fetchData();
  }, [deliveryId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0A2FCC" />
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C1A" />

      <View style={styles.header}>
        <View style={styles.successIcon}>
          <Text style={{ fontSize: 32 }}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Livraison réussie !</Text>
        <Text style={styles.successSub}>Bastos → Mvan · 22 min · 3.2 km</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          {[
            { val: "22 min", label: "Durée" },
            { val: "3.2 km", label: "Distance" },
            { val: "1 760F", label: "Payé" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statVal}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.proofBox}>
          <Text style={styles.proofText}>📸 Photo de preuve disponible</Text>
        </View>

        <Text style={styles.ratingQ}>Comment était Jean-Baptiste ?</Text>
        <View style={styles.riderRow}>
          <View style={styles.riderAvatar}>
            <Text style={{ fontSize: 24 }}>👨🏿</Text>
          </View>
          <View>
            <Text style={styles.riderName}>Jean-Baptiste K.</Text>
            <Text style={styles.riderPrev}>Note actuelle : 4.9 ★</Text>
          </View>
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setStars(n)}>
              <Text style={[styles.star, n <= stars && styles.starLit]}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.commentBox}>
          <Text style={styles.commentPlaceholder}>
            Laisser un commentaire (optionnel)...
          </Text>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.push("/historique")}
        >
          <Text style={styles.doneBtnText}>✓ Envoyer ma note</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>📤 Partager ma livraison</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#080C1A",
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  successIcon: {
    width: 68,
    height: 68,
    backgroundColor: "#00C48C",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#00C48C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  successSub: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  bodyContent: { padding: 18, paddingBottom: 40 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 11,
    padding: 11,
    alignItems: "center",
  },
  statVal: { fontSize: 15, fontWeight: "800", color: "#111827" },
  statLabel: { fontSize: 9, color: "#9CA3AF", marginTop: 3 },
  proofBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 13,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderStyle: "dashed",
  },
  proofText: { fontSize: 13, color: "#6B7280" },
  ratingQ: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 14,
  },
  riderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0A2FCC",
    alignItems: "center",
    justifyContent: "center",
  },
  riderName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  riderPrev: { fontSize: 11, color: "#9CA3AF" },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  star: { fontSize: 30, opacity: 0.3 },
  starLit: { opacity: 1 },
  commentBox: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderRadius: 11,
    padding: 12,
    height: 60,
    marginBottom: 16,
  },
  commentPlaceholder: { fontSize: 12, color: "#9CA3AF" },
  doneBtn: {
    backgroundColor: "#0A2FCC",
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  shareBtn: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E4DF",
    borderRadius: 13,
    paddingVertical: 12,
    alignItems: "center",
  },
  shareBtnText: { fontSize: 13, fontWeight: "600", color: "#111827" },
});
