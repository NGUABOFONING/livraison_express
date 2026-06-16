import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050A20" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🚗</Text>
        </View>

        {/* TITRE */}
        <Text style={styles.title}>
          Livraison{"\n"}
          <Text style={styles.titleYellow}>Express CM</Text>
        </Text>

        {/* SOUS-TITRE */}
        <Text style={styles.subtitle}>
          Livraison rapide par moto à Yaoundé & Douala
        </Text>

        {/* PILLS */}
        <View style={styles.pillsRow}>
          {[
            { key: "colis", label: "Colis", icon: <FontAwesome5 name="box" size={18} color="#fcf8f8" /> },
            { key: "repas", label: "Repas", icon: <Ionicons name="fast-food" size={18} color="#fcf8f8" /> },
            { key: "medicaments", label: "Médicaments", icon: <FontAwesome5 name="pills" size={18} color="#fcf8f8" /> },
            { key: "docs", label: "Docs", icon: <MaterialIcons name="description" size={18} color="#fcf8f8" /> },
          ].map((pill) => (
      <View key={pill.key} style={styles.pill}>
         <Text style={styles.pillText}>
            {pill.icon} {"  "}
             {pill.label}
          </Text>
       </View>
))}
        </View>

        {/* BOUTONS */}
        <TouchableOpacity
          style={styles.btnYellow}
          onPress={() => router.push('./File_client/inscription')}
        >
          <Text style={styles.btnYellowText}>Commencer →</Text>
        </TouchableOpacity>
        


        <TouchableOpacity
          style={styles.btnGhost}
          onPress={() => router.push("./File_client/connexion")}
        >
          <Text style={styles.btnGhostText}>J'ai déjà un compte</Text>
        </TouchableOpacity>

        {/* FOOTER */}
        <Text style={styles.footer}>🇨🇲 Made in Cameroun · v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A20",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoIcon: { fontSize: 38 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 10,
  },
  titleYellow: { color: "#FFB800" },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 220,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 28,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 11, color: "rgba(255,255,255,0.65)" },
  btnYellow: {
    backgroundColor: "#FFB800",
    borderRadius: 13,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnYellowText: { fontSize: 15, fontWeight: "700", color: "#080C1A" },
  btnGhost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 13,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  btnGhostText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  footer: { fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" },
});
