import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const STEPS = [
  { icon: '✓', label: 'Commande confirmée', sub: '10h02 · Paiement reçu', done: true },
  { icon: '✓', label: 'Coursier assigné', sub: '10h04 · Jean-Baptiste K.', done: true },
  { icon: '🏍️', label: 'En route vers vous', sub: 'Mis à jour · il y a 5s', active: true },
  { icon: '📦', label: 'Livraison confirmée', sub: 'En attente', todo: true },
];

export default function SuiviScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#A0BEF5" />

      <View style={styles.mapBox}>
        <Text style={[styles.mapPin, { top: '15%', left: '58%' }]}>📍</Text>
        <Text style={[styles.mapPin, { top: '50%', left: '20%', fontSize: 18 }]}>🟢</Text>
        <Text style={[styles.mapPin, { top: '30%', left: '40%', fontSize: 22 }]}>🏍️</Text>
        <View style={styles.etaBubble}>
          <View style={styles.etaPill}>
            <Text style={styles.etaTime}>8 min</Text>
          </View>
          <View>
            <Text style={styles.etaTitle}>Coursier à 1.2 km</Text>
            <Text style={styles.etaSub}>Arrivée estimée · 10h19</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepsCard}>
          {STEPS.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepCol}>
                <View style={[
                  styles.stepCircle,
                  step.done && styles.stepCircleDone,
                  step.active && styles.stepCircleActive,
                ]}>
                  <Text style={styles.stepCircleText}>{step.icon}</Text>
                </View>
                {idx < STEPS.length - 1 && (
                  <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.todo && { color: '#9CA3AF' }]}>
                  {step.label}
                </Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <Text style={{ fontSize: 22 }}>👨🏿</Text>
          </View>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>Jean-Baptiste K.</Text>
            <Text style={styles.riderStars}>★★★★★</Text>
            <Text style={styles.riderMeta}>4.9 · 247 livraisons · CM 2341 YA</Text>
          </View>
          <View style={styles.riderActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}>
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F0FDF4' }]}>
              <Text style={{ fontSize: 18 }}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>✕ Annuler la livraison</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F4F0' },
  mapBox: { height: 230, backgroundColor: '#A0BEF5', position: 'relative', overflow: 'hidden' },
  mapPin: { position: 'absolute', fontSize: 22 },
  etaBubble: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 13,
    padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 4,
  },
  etaPill: { backgroundColor: '#0A2FCC', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  etaTime: { fontSize: 17, fontWeight: '800', color: '#fff' },
  etaTitle: { fontSize: 12, fontWeight: '700', color: '#111827' },
  etaSub: { fontSize: 10, color: '#6B7280' },
  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 30 },
  stepsCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepCol: { alignItems: 'center' },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: '#0A2FCC' },
  stepCircleActive: { backgroundColor: '#FFB800' },
  stepCircleText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  stepLine: {
    width: 2, flex: 1, minHeight: 14,
    backgroundColor: '#E5E7EB', marginVertical: 3,
  },
  stepLineDone: { backgroundColor: '#0A2FCC' },
  stepContent: { flex: 1, paddingBottom: 14 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 },
  stepSub: { fontSize: 10, color: '#9CA3AF' },
  riderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 13, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  riderAvatar: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: '#0A2FCC', alignItems: 'center', justifyContent: 'center',
  },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  riderStars: { fontSize: 11, color: '#FFB800', letterSpacing: 1, marginVertical: 2 },
  riderMeta: { fontSize: 10, color: '#9CA3AF' },
  riderActions: { flexDirection: 'row', gap: 7 },
  actionBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: {
    backgroundColor: '#FEF2F2', borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.2)', borderRadius: 13,
    paddingVertical: 12, alignItems: 'center', marginTop: 4,
  },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: '#FF4D4D' },
});