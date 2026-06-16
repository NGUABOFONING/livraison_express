import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

// ✅ Import du composant géolocalisation séparé
import Navigation, { ParamsCommande } from "../File_client/navigation";

const CATEGORIES = [
  { icon: "📦", name: "Colis", desc: "Documents, achats", bg: "#0A2FCC", badge: "Rapide" },
  { icon: "🍔", name: "Repas", desc: "Restaurants", bg: "#FF6B35", badge: null },
  { icon: "💊", name: "Médicaments", desc: "Pharmacies", bg: "#00C48C", badge: null },
  { icon: "📄", name: "Documents", desc: "Urgent", bg: "#8B5CF6", badge: "Express" },
];

const RECENTS = [
  { icon: "📦", title: "Colis — Bastos", meta: "Hier · 3.2 km", price: "1 500 F", status: "✓ Livré", iconBg: "#EEF2FF" },
  { icon: "🍔", title: "Repas — Nlongkak", meta: "Lundi · 1.8 km", price: "1 040 F", status: "✓ Livré", iconBg: "#FFF7ED" },
];

const NAV_TABS = [
  { icon: "🏠", label: "Accueil", route: "/accueil-client", active: true },
  { icon: "📦", label: "Courses", route: "/historique", active: false },
  { icon: "💳", label: "Paiement", route: "/confirmer-paiement", active: false },
  { icon: "👤", label: "Profil", route: "/profil-client", active: false },
];

export default function AccueilClientScreen() {
  const [nom, setNom]         = useState("...");
  const [adresse, setAdresse] = useState("Localisation...");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data && data.full_name) {
        const prenom = data.full_name.trim().split(" ")[0];
        setNom(prenom);
      }
    };
    getUser();
  }, []);

  // ── Callback reçu depuis CarteCoursiers quand le client confirme un coursier ──
  const handleCommanderAvecCoursier = (params: ParamsCommande) => {
    router.push({
      pathname: "../File_client/passer-commande",
      params,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2FCC" />

      {/* EN-TÊTE */}
      <View style={styles.header}>
        <Text style={styles.headerLoc}>📍 {adresse}</Text>
        <Text style={styles.headerGreet}>
          Bonjour, <Text style={styles.headerName}>{nom}</Text> 👋
        </Text>
        <View style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifDot} />
        </View>
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>Où livrer aujourd'hui ?</Text>
      </View>

      {/* CONTENU DÉFILABLE */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════
            SECTION GÉOLOCALISATION — composant externe
            Toute la logique est dans CarteCoursiers.tsx
        ══════════════════════════════════════════════ */}
        <Text style={styles.sectionLabel}>Coursiers proches de vous</Text>
        <Navigation
          onCommanderAvecCoursier={handleCommanderAvecCoursier}
          onAdresseChange={(a) => setAdresse(a)}
        />

        {/* ══════════════════════════════════════════════
            RESTE DE LA PAGE — inchangé
        ══════════════════════════════════════════════ */}
        <Text style={styles.sectionLabel}>Que livrer ?</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[styles.catCard, { backgroundColor: cat.bg }]}
              onPress={() => router.push("../File_client/passer-commande")}
            >
              {cat.badge && (
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{cat.badge}</Text>
                </View>
              )}
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Offre</Text>
        <View style={styles.promoCard}>
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>-20%</Text>
          </View>
          <Text style={styles.promoText}>
            1ère livraison !{"\n"}Code :{" "}
            <Text style={styles.promoCode}>LECM2026</Text>
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Récentes</Text>
        {RECENTS.map((item, idx) => (
          <View key={idx} style={styles.recentCard}>
            <View style={[styles.recentIcon, { backgroundColor: item.iconBg }]}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentMeta}>{item.meta}</Text>
            </View>
            <View style={styles.recentRight}>
              <Text style={styles.recentPrice}>{item.price}</Text>
              <Text style={styles.recentStatus}>{item.status}</Text>
            </View>
          </View>
        ))}

        {/* ── BANNIÈRE DEVENIR COURSIER ── */}
        <TouchableOpacity
          style={styles.courierBanner}
          onPress={() => router.push("../inscription_coursier")}
          activeOpacity={0.85}
        >
          <View style={styles.courierLeft}>
            <Text style={styles.courierIcon}>🏍️</Text>
            <View>
              <Text style={styles.courierTitle}>Devenir coursier</Text>
              <Text style={styles.courierSub}>Gagne de l'argent en livrant</Text>
            </View>
          </View>
          <View style={styles.courierArrowBox}>
            <Text style={styles.courierArrow}>→</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* BARRE NAV BAS */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navTab}
            onPress={() => router.push(tab.route as any)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            {tab.active && <View style={styles.navDot} />}
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>
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
    backgroundColor: "#0A2FCC",
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 22,
  },
  headerLoc: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 4 },
  headerGreet: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerName: { color: "#FFB800" },
  notifBtn: {
    position: "absolute", right: 14, top: 13,
    width: 36, height: 36, backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 11, alignItems: "center", justifyContent: "center",
  },
  notifIcon: { fontSize: 16 },
  notifDot: {
    position: "absolute", top: -1, right: -1,
    width: 10, height: 10, backgroundColor: "#FFB800",
    borderRadius: 5, borderWidth: 2, borderColor: "#0A2FCC",
  },
  searchBar: {
    backgroundColor: "#fff", borderRadius: 13,
    marginTop: -12, marginHorizontal: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, zIndex: 2,
  },
  searchIcon: { fontSize: 16 },
  searchText: { fontSize: 13, color: "#9CA3AF" },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingTop: 16, paddingBottom: 24 },
  sectionLabel: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5,
    textTransform: "uppercase", color: "#9CA3AF", marginBottom: 8, marginTop: 12,
  },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catCard: { width: "47.5%", borderRadius: 14, padding: 12, minHeight: 90 },
  catBadge: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  catBadgeText: { fontSize: 8, color: "#fff", fontWeight: "700" },
  catIcon: { fontSize: 24, marginBottom: 6 },
  catName: { fontSize: 13, fontWeight: "700", color: "#fff" },
  catDesc: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  promoCard: {
    backgroundColor: "#1F2937", borderRadius: 13, padding: 13,
    borderWidth: 1, borderColor: "rgba(255,184,0,0.18)",
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  promoBadge: { backgroundColor: "#FFB800", borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  promoBadgeText: { fontSize: 18, fontWeight: "800", color: "#080C1A" },
  promoText: { fontSize: 12, color: "#fff", lineHeight: 18 },
  promoCode: { color: "#FFB800", fontWeight: "700" },
  recentCard: {
    backgroundColor: "#fff", borderRadius: 13, padding: 11,
    flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  recentIcon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 13, fontWeight: "600", color: "#111827" },
  recentMeta: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  recentRight: { alignItems: "flex-end" },
  recentPrice: { fontSize: 13, fontWeight: "700", color: "#0A2FCC" },
  recentStatus: { fontSize: 10, fontWeight: "700", color: "#00C48C", marginTop: 2 },
  courierBanner: {
    backgroundColor: "#080C1A", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 14, borderWidth: 1, borderColor: "rgba(255,184,0,0.25)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  courierLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  courierIcon: { fontSize: 30 },
  courierTitle: { fontSize: 14, fontWeight: "800", color: "#fff", marginBottom: 2 },
  courierSub: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  courierArrowBox: {
    width: 34, height: 34, backgroundColor: "#FFB800",
    borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  courierArrow: { fontSize: 16, fontWeight: "800", color: "#080C1A" },
  bottomNav: {
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F3F4F6",
    flexDirection: "row", paddingBottom: 8, paddingTop: 6,
  },
  navTab: { flex: 1, alignItems: "center", gap: 2 },
  navIcon: { fontSize: 20 },
  navDot: { width: 4, height: 4, backgroundColor: "#0A2FCC", borderRadius: 2 },
  navLabel: { fontSize: 9, fontWeight: "600", color: "#9CA3AF" },
  navLabelActive: { color: "#0A2FCC" },
});
