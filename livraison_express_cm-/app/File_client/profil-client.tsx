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

const SECTIONS = [
  {
    title: "Mon compte",
    items: [
      {
        icon: "👤",
        iconBg: "#EEF2FF",
        label: "Modifier mon profil",
        sub: null,
      },
      {
        icon: "📍",
        iconBg: "#EEF2FF",
        label: "Adresses favorites",
        sub: "Maison, Bureau",
      },
      { icon: "🔔", iconBg: "#FFF8ED", label: "Notifications", sub: null },
    ],
  },
  {
    title: "Paiement",
    items: [
      {
        icon: "📱",
        iconBg: "#F0FDF4",
        label: "MTN MoMo",
        sub: "+237 6 71 23 45 67",
      },
      { icon: "🧾", iconBg: "#FFF8ED", label: "Mes factures", sub: null },
    ],
  },
  {
    title: "Aide",
    items: [
      { icon: "💬", iconBg: "#EEF2FF", label: "Support client", sub: null },
      {
        icon: "⭐",
        iconBg: "#FFF8ED",
        label: "Noter l'application",
        sub: null,
      },
      {
        icon: "📋",
        iconBg: "#EEF2FF",
        label: "Conditions d'utilisation",
        sub: null,
      },
    ],
  },
];

const NAV_TABS = [
  { icon: "🏠", label: "Accueil", route: "/accueil-client", active: false },
  { icon: "📦", label: "Courses", route: "/historique", active: false },
  {
    icon: "💳",
    label: "Paiement",
    route: "/confirmer-paiement",
    active: false,
  },
  { icon: "👤", label: "Profil", route: "/profil-client", active: true },
];

export default function ProfilClientScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C1A" />

      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 30 }}>👨🏿</Text>
          </View>
          <View style={styles.editBadge}>
            <Text style={{ fontSize: 10 }}>✏️</Text>
          </View>
        </View>
        <Text style={styles.profileName}>Paul Mbarga</Text>
        <Text style={styles.profilePhone}>+237 6 71 23 45 67</Text>
        <View style={styles.statsRow}>
          {[
            { val: "47", label: "Livraisons" },
            { val: "4.8★", label: "Ma note" },
            { val: "32K", label: "FCFA dépensé" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statVal}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.sectionRow,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: "#F9FAFB" },
                ]}
              >
                <View
                  style={[styles.rowIcon, { backgroundColor: item.iconBg }]}
                >
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.sub && <Text style={styles.rowSub}>{item.sub}</Text>}
                </View>
                <Text style={styles.rowArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity
          style={{
            backgroundColor: "#0A2FCC",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            marginBottom: 12,
          }}
          onPress={() => router.push("/Coursier/inscription_coursier")}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            🏍️ Devenir coursier
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.logoutText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navTab}
            onPress={() => router.push(tab.route as any)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            {tab.active && <View style={styles.navDot} />}
            <Text
              style={[styles.navLabel, tab.active && styles.navLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F4F0" },
  header: {
    backgroundColor: "#080C1A",
    paddingTop: 16,
    paddingBottom: 36,
    alignItems: "center",
    paddingHorizontal: 14,
  },
  avatarWrap: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#0A2FCC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    backgroundColor: "#FFB800",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  profilePhone: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 11,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
  },
  statVal: { fontSize: 17, fontWeight: "800", color: "#FFB800" },
  statLabel: { fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 30 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#9CA3AF",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 11,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 13, fontWeight: "600", color: "#111827" },
  rowSub: { fontSize: 11, color: "#9CA3AF", marginTop: 1 },
  rowArrow: { fontSize: 16, color: "#9CA3AF" },
  logoutBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "rgba(255,77,77,0.2)",
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  logoutText: { fontSize: 14, fontWeight: "700", color: "#FF4D4D" },
  bottomNav: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 6,
  },
  navTab: { flex: 1, alignItems: "center", gap: 2, },
  navIcon: { fontSize: 20 },
  navDot: { width: 4, height: 4, backgroundColor: "#0A2FCC", borderRadius: 2 },
  navLabel: { fontSize: 9, fontWeight: "600", color: "#9CA3AF" },
  navLabelActive: { color: "#0A2FCC" },
});
