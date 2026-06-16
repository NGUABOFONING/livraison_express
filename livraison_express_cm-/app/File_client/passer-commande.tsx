import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function PasserCommandeScreen() {
  const [typeSelected, setTypeSelected] = useState("standard");
  const [paySelected, setPaySelected] = useState("momo");

  const [pickupAddress] = useState("Carrefour Nlongkak");
  //const [deliveryAddress] = useState(""); Ajouter une adresse de livraison par défaut
  const [deliveryAddress, setDeliveryAddress] = useState("Yassa");

  const handleOrder = async () => {
    console.log("🚀 START ORDER");

    try {
      // 🔐 récupérer user connecté
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        Alert.alert("Erreur", "Utilisateur non connecté");
        return;
      }

      const userId = userData.user.id;

      // ❌ validation minimale
      if (!deliveryAddress || deliveryAddress.trim() === "") {
        Alert.alert("Erreur", "Veuillez renseigner la destination");
        return;
      }

      // 💾 INSERT BASE DE DONNÉES
      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          user_id: userId,
          pickup_address: pickupAddress,
          delivery_address: deliveryAddress,
          price: typeSelected === "express" ? 2260 : 1760,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.log("INSERT ERROR:", error.message);
        Alert.alert("Erreur", "Impossible de créer la commande");
        return;
      }
      console.log("DELIVERY CREATED SUCCESS:", data);
      if (!data?.id) {
        Alert.alert("Erreur", "Commande non créée");
        return;
      }

      // 🚀 redirection
      router.push({
        pathname: "../File_client/confirmer-paiement",
        params: {
          deliveryId: data.id,
          amount: typeSelected === "express" ? 2260 : 1760,
          method: paySelected,
        },
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Erreur", "Une erreur est survenue");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle livraison</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>1/3</Text>
        </View>
      </View>

      {/* MINI CARTE */}
      <View style={styles.mapBox}>
        <Text style={[styles.mapPin, { top: "18%", left: "22%" }]}>🟢</Text>
        <Text style={[styles.mapPin, { top: "50%", left: "60%" }]}>📍</Text>
        <Text
          style={[styles.mapPin, { top: "30%", left: "42%", fontSize: 20 }]}
        >
          🏍️
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ADRESSES */}
        <View style={styles.addrCard}>
          <View style={styles.addrRow}>
            <View style={[styles.dot, { backgroundColor: "#00C48C" }]} />
            <View>
              <Text style={styles.addrLabel}>Départ</Text>
              <Text style={styles.addrVal}>Carrefour Nlongkak</Text>
            </View>
          </View>
          <View style={styles.addrDivider} />
          <View style={styles.addrRow}>
            <View style={[styles.dot, { backgroundColor: "#FF4D4D" }]} />
            <View>
              <Text style={styles.addrLabel}>Arrivée</Text>
              <Text style={[styles.addrVal, { color: "#9CA3AF" }]}>
                Saisir la destination...
              </Text>
            </View>
          </View>
        </View>

        {/* TYPE */}
        <Text style={styles.sectionLabel}>Type de livraison</Text>
        <View style={styles.typeRow}>
          {[
            {
              key: "standard",
              icon: "🚗",
              name: "Standard",
              time: "~45 min",
              extra: null,
            },
            {
              key: "express",
              icon: "⚡",
              name: "Express",
              time: "~20 min",
              extra: "+500 F",
            },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.typeCard,
                typeSelected === opt.key && styles.typeCardSel,
              ]}
              onPress={() => setTypeSelected(opt.key)}
            >
              <Text style={styles.typeIcon}>{opt.icon}</Text>
              <Text style={styles.typeName}>{opt.name}</Text>
              <Text style={styles.typeTime}>{opt.time}</Text>
              {opt.extra && <Text style={styles.typeExtra}>{opt.extra}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.sectionLabel}>Description colis</Text>
        <View style={styles.pkgInput}>
          <Text style={styles.pkgInputText}>
            📝 Ex: Documents, médicaments...
          </Text>
        </View>

        {/* PRIX */}
        <Text style={styles.sectionLabel}>Prix estimé</Text>
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Distance</Text>
            <Text style={styles.priceVal}>4.2 km</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Durée estimée</Text>
            <Text style={styles.priceVal}>~38 min</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceTotalLabel}>Total</Text>
            <Text style={styles.priceTotalVal}>1 760 F</Text>
          </View>
        </View>

        {/* PAIEMENT */}
        <Text style={styles.sectionLabel}>Paiement</Text>
        <View style={styles.payRow}>
          {[
            { key: "momo", icon: "📱", name: "MTN MoMo" },
            { key: "orange", icon: "🟠", name: "Orange" },
            { key: "cash", icon: "💵", name: "Espèces" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.payOpt,
                paySelected === opt.key && styles.payOptSel,
              ]}
              onPress={() => setPaySelected(opt.key)}
            >
              <Text style={styles.payIcon}>{opt.icon}</Text>
              <Text style={styles.payName}>{opt.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
          <Text style={styles.orderBtnText}>
            🚗 Commander · {typeSelected === "express" ? "2 260" : "1 760"} FCFA
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF8" },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    backgroundColor: "#F9FAFB",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "800", color: "#111827" },
  stepBadge: {
    backgroundColor: "#0A2FCC",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepText: { fontSize: 10, fontWeight: "700", color: "#fff" },
  mapBox: {
    height: 160,
    backgroundColor: "#A0BEF5",
    position: "relative",
    overflow: "hidden",
  },
  mapPin: { position: "absolute", fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 30 },
  addrCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  addrRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  addrDivider: { height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  addrLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addrVal: { fontSize: 13, fontWeight: "600", color: "#111827" },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 8,
    marginTop: 12,
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  typeCardSel: { borderColor: "#0A2FCC", backgroundColor: "#EEF2FF" },
  typeIcon: { fontSize: 20, marginBottom: 4 },
  typeName: { fontSize: 12, fontWeight: "700", color: "#111827" },
  typeTime: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  typeExtra: {
    fontSize: 10,
    color: "#FF9500",
    fontWeight: "600",
    marginTop: 2,
  },
  pkgInput: {
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 13,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pkgInputText: { fontSize: 13, color: "#9CA3AF" },
  priceCard: {
    backgroundColor: "#1F2937",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.12)",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)" },
  priceVal: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginVertical: 8,
  },
  priceTotalLabel: { fontSize: 13, color: "rgba(255,255,255,0.65)" },
  priceTotalVal: { fontSize: 22, fontWeight: "800", color: "#FFB800" },
  payRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
  payOpt: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  payOptSel: { borderColor: "#FF9500", backgroundColor: "#FFF8ED" },
  payIcon: { fontSize: 18, marginBottom: 3 },
  payName: { fontSize: 9, fontWeight: "700", color: "#374151" },
  orderBtn: {
    backgroundColor: "#0A2FCC",
    borderRadius: 13,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  orderBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
