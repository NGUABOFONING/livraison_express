import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
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

export default function ConfirmerPaiementScreen() {
  const { deliveryId, amount, method } = useLocalSearchParams();
  console.log("PARAMS:", deliveryId, amount, method);

  const handlePayment = async () => {
    const { data: userData } = await supabase.auth.getUser();

    const userId = userData?.user?.id;

    const { error } = await supabase.from("payments").insert({
      delivery_id: deliveryId,
      user_id: userId,
      amount: Number(amount),
      status: "pending",
      payment_method: method,
      phone: "+237XXXXXXXXX", // à remplacer par input réel
      currency: "XAF",
    });

    if (error) {
      console.log(error);
      Alert.alert("Erreur", "Paiement non enregistré");
      return;
    }
    console.log("PAYMENT CREATED SUCCESS");

    router.push({
      pathname: "./File_client/livraison-confirmer",
      params: { deliveryId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2FCC" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmer le paiement</Text>
        <Text style={styles.headerSub}>Livraison · Nlongkak → Bastos</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Montant total</Text>
          <Text style={styles.amountValue}>1 760 FCFA</Text>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodIcon}>📱</Text>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>MTN Mobile Money</Text>
            <Text style={styles.methodSub}>Paiement instantané · sécurisé</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.methodChange}>Changer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          {[
            { label: "Course standard", val: "1 260 F" },
            { label: "Frais de service", val: "500 F" },
            { label: "Promo LECM2026", val: "- 0 F", green: true },
          ].map((row) => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text
                style={[
                  styles.summaryVal,
                  (row as any).green && { color: "#00C48C" },
                ]}
              >
                {row.val}
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total à payer</Text>
            <Text style={styles.summaryTotalVal}>1 760 F</Text>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Numéro MoMo</Text>
        <View style={styles.momoField}>
          <Text style={styles.momoFlag}>📱</Text>
          <Text style={styles.momoNum}>+237 6 71 23 45 67</Text>
        </View>

        <View style={styles.securityBox}>
          <Text style={{ fontSize: 16 }}>🔒</Text>
          <Text style={styles.securityText}>
            Paiement sécurisé · Remboursement garanti
          </Text>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>💳 Payer 1 760 FCFA maintenant</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#0A2FCC",
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 36,
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
  },
  bodyContent: { padding: 18, paddingBottom: 40 },
  amountBlock: { alignItems: "center", paddingVertical: 18 },
  amountLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  amountValue: { fontSize: 34, fontWeight: "800", color: "#111827" },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8ED",
    borderWidth: 1.5,
    borderColor: "rgba(255,149,0,0.3)",
    borderRadius: 13,
    padding: 13,
    marginBottom: 16,
    gap: 10,
  },
  methodIcon: { fontSize: 26 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  methodSub: { fontSize: 11, color: "#6B7280" },
  methodChange: { fontSize: 11, color: "#0A2FCC", fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 13,
    padding: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 12, color: "#6B7280" },
  summaryVal: { fontSize: 13, fontWeight: "600", color: "#111827" },
  summaryDivider: { height: 1, backgroundColor: "#E5E4DF", marginVertical: 10 },
  summaryTotalLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  summaryTotalVal: { fontSize: 18, fontWeight: "800", color: "#0A2FCC" },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  momoField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#0A2FCC",
    borderRadius: 11,
    overflow: "hidden",
    marginBottom: 14,
  },
  momoFlag: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#E5E4DF",
  },
  momoNum: {
    flex: 1,
    paddingHorizontal: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 1,
  },
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  securityText: { fontSize: 11, color: "#00C48C", fontWeight: "600" },
  payBtn: {
    backgroundColor: "#FFB800",
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  payBtnText: { fontSize: 15, fontWeight: "800", color: "#080C1A" },
});
