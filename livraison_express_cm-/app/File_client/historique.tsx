import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const FILTERS = ['Toutes', '✓ Livrées', '✕ Annulées', '📅 Ce mois'];
const ORDERS = [
  {
    icon: '📦', iconBg: '#EEF2FF', title: 'Colis — Documents',
    meta: "Aujourd'hui · 10h22 · 22 min", price: '1 760 F',
    status: '✓ Livré', statusOk: true, from: 'Nlongkak', to: 'Bastos', stars: '⭐⭐⭐⭐⭐',
  },
  {
    icon: '🍔', iconBg: '#FFF7ED', title: 'Repas — Pizza',
    meta: 'Hier · 13h15 · 14 min', price: '1 040 F',
    status: '✓ Livré', statusOk: true, from: 'Nlongkak', to: 'Mvan', stars: '⭐⭐⭐⭐',
  },
  {
    icon: '📦', iconBg: '#FEE2E2', title: 'Colis — Vêtements',
    meta: 'Lundi · 16h42 · —', price: '0 F',
    status: '✕ Annulé', statusOk: false, from: 'Centre-ville', to: 'Biyem-Assi', stars: null,
  },
];

const NAV_TABS = [
  { icon: '🏠', label: 'Accueil', route: '/accueil-client', active: false },
  { icon: '📦', label: 'Courses', route: '/historique', active: true },
  { icon: '💳', label: 'Paiement', route: '/confirmer-paiement', active: false },
  { icon: '👤', label: 'Profil', route: '/profil-client', active: false },
];

export default function HistoriqueScreen() {
  const [activeFilter, setActiveFilter] = useState('Toutes');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2FCC" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes livraisons</Text>
      </View>

      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ORDERS.map((order, idx) => (
          <View key={idx} style={styles.orderCard}>
            <View style={styles.orderTop}>
              <View style={[styles.orderIcon, { backgroundColor: order.iconBg }]}>
                <Text style={{ fontSize: 18 }}>{order.icon}</Text>
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderMeta}>{order.meta}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderPrice}>{order.price}</Text>
                <Text style={[styles.orderStatus, order.statusOk ? styles.statusOk : styles.statusCancel]}>
                  {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#00C48C' }]} />
              <Text style={styles.routeAddr}>{order.from}</Text>
              <Text style={styles.routeArrow}>→</Text>
              <View style={[styles.routeDot, { backgroundColor: '#FF4D4D' }]} />
              <Text style={styles.routeAddr}>{order.to}</Text>
            </View>
            <View style={styles.orderFooter}>
              {order.stars
                ? <Text style={styles.stars}>{order.stars}</Text>
                : <Text style={styles.refund}>Remboursement effectué</Text>
              }
              <TouchableOpacity>
                <Text style={styles.reorderText}>
                  {order.statusOk ? '↩ Commander à nouveau' : 'ℹ Détails'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F4F0' },
  header: { backgroundColor: '#0A2FCC', paddingHorizontal: 14, paddingTop: 13, paddingBottom: 18 },
  backBtn: {
    width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  filtersScroll: { backgroundColor: '#fff', flexGrow: 0 },
  filtersContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E4DF', backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#0A2FCC', borderColor: '#0A2FCC' },
  filterText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  filterTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { padding: 10, paddingBottom: 24 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 13, marginBottom: 9,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  orderIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderMeta: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  orderRight: { alignItems: 'flex-end' },
  orderPrice: { fontSize: 14, fontWeight: '700', color: '#0A2FCC' },
  orderStatus: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  statusOk: { color: '#00C48C' },
  statusCancel: { color: '#FF4D4D' },
  routeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 9,
    paddingHorizontal: 10, paddingVertical: 8, gap: 6,
  },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeAddr: { fontSize: 11, fontWeight: '600', color: '#111827' },
  routeArrow: { fontSize: 11, color: '#9CA3AF' },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  stars: { fontSize: 12 },
  refund: { fontSize: 10, color: '#FF4D4D' },
  reorderText: { fontSize: 11, color: '#0A2FCC', fontWeight: '700' },
  bottomNav: {
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
    flexDirection: 'row', paddingBottom: 8, paddingTop: 6,
  },
  navTab: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 20 },
  navDot: { width: 4, height: 4, backgroundColor: '#0A2FCC', borderRadius: 2 },
  navLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF' },
  navLabelActive: { color: '#0A2FCC' },
});