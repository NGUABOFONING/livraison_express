
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Circle,
  Marker,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "../../lib/supabase";


// ─────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────
const RAYON_KM = 2; // Distance max pour afficher un coursier

// ─────────────────────────────────────────────
//  FORMULE HAVERSINE — distance en km
// ─────────────────────────────────────────────
function distanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
export type Position = {
  latitude: number;
  longitude: number;
};

export type Coursier = {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  note: number;
  distance: number;   // calculé localement en km
  disponible: boolean;
};

export type ParamsCommande = {
  coursierId: string;
  coursierNom: string;
  coursierLat: string;
  coursierLon: string;
  clientLat: string;
  clientLon: string;
};

// ─────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────
type Props = {
  /** Callback appelé quand le client confirme avec un coursier */
  onCommanderAvecCoursier: (params: ParamsCommande) => void;
  /** Callback optionnel : expose la position du client au parent */
  onPositionClient?: (pos: Position) => void;
  /** Callback optionnel : expose la vraie adresse (ville + quartier) au parent */
  onAdresseChange?: (adresse: string) => void;
};

// ─────────────────────────────────────────────
//  COMPOSANT
// ─────────────────────────────────────────────
export default function CarteCoursiers({
  onCommanderAvecCoursier,
  onPositionClient,
  onAdresseChange,
}: Props) {
  const [position, setPosition]                       = useState<Position | null>(null);
  const [region, setRegion]                           = useState<Region | null>(null);
  const [coursiers, setCoursiers]                     = useState<Coursier[]>([]);
  const [coursierSelectionne, setCoursierSelectionne] = useState<Coursier | null>(null);
  const [chargement, setChargement]                   = useState(true);
  const [erreur, setErreur]                           = useState("");
  const mapRef = useRef<MapView>(null);

  // ── Au montage : géolocaliser le client ──
  useEffect(() => {
    geolocalisierClient();
  }, []);

  // ─────────────────────────────────────────
  //  1. Géolocalisation du client
  // ─────────────────────────────────────────
  const geolocalisierClient = async () => {
    setChargement(true);
    setErreur("");
    setCoursierSelectionne(null);

    // Demande de permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErreur("Permission de localisation refusée.\nActive-la dans les paramètres.");
      setChargement(false);
      return;
    }

    try {
      // Obtenir la position GPS haute précision
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const pos: Position = {
        latitude:  loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setPosition(pos);
      onPositionClient?.(pos);

      // ── Géocodage inverse → obtenir ville + quartier exact ──
      try {
        const addrs = await Location.reverseGeocodeAsync(pos);
        if (addrs.length > 0) {
          const a = addrs[0];
          // Construire une adresse lisible : quartier, ville, pays
          const parties = [
            a.district ?? a.subregion ??
            a.city ?? a.region,
          ].filter(Boolean);
          const adresseComplete = parties.length > 0
            ? parties.join(", ")
            : "Position détectée";
          onAdresseChange?.(adresseComplete);
        }
      } catch {
        onAdresseChange?.("Position détectée");
      }

      // Région initiale de la carte (zoom sur le client)
      const reg: Region = {
        latitude:       pos.latitude,
        longitude:      pos.longitude,
        latitudeDelta:  0.025,
        longitudeDelta: 0.025,
      };
      setRegion(reg);

      // Centrer la carte
      mapRef.current?.animateToRegion(reg, 800);

      // Charger les coursiers proches
      await chargerCoursiersProches(pos);

    } catch {
      setErreur("Impossible d'obtenir votre position.\nVérifiez votre GPS.");
    } finally {
      setChargement(false);
    }
  };

  // ─────────────────────────────────────────
  //  2. Charger les coursiers depuis Supabase
  // ─────────────────────────────────────────
  const chargerCoursiersProches = async (pos: Position) => {
    const { data, error } = await supabase
      .from("coursiers_positions")
      .select("id, nom, latitude, longitude, note, disponible")
      .eq("disponible", true);

    if (error || !data) {
      console.log("Erreur chargement coursiers:", error?.message);
      return;
    }

    // Filtrer ≤ 2km et trier par distance croissante
    const proches: Coursier[] = data
      .map((c: any) => ({
        ...c,
        distance: distanceKm(pos.latitude, pos.longitude, c.latitude, c.longitude),
      }))
      .filter((c: Coursier) => c.distance <= RAYON_KM)
      .sort((a: Coursier, b: Coursier) => a.distance - b.distance);

    setCoursiers(proches);
  };

  // ─────────────────────────────────────────
  //  3. Sélectionner un coursier
  //     → zoom pour voir client + coursier
  // ─────────────────────────────────────────
  const handleSelectionnerCoursier = (c: Coursier) => {
    setCoursierSelectionne(c);

    if (!position) return;

    // Calculer une région qui englobe les deux marqueurs
    const minLat = Math.min(position.latitude, c.latitude);
    const maxLat = Math.max(position.latitude, c.latitude);
    const minLon = Math.min(position.longitude, c.longitude);
    const maxLon = Math.max(position.longitude, c.longitude);

    mapRef.current?.animateToRegion(
      {
        latitude:       (minLat + maxLat) / 2,
        longitude:      (minLon + maxLon) / 2,
        latitudeDelta:  (maxLat - minLat) * 2.2 + 0.01,
        longitudeDelta: (maxLon - minLon) * 2.2 + 0.01,
      },
      700
    );
  };

  // ─────────────────────────────────────────
  //  4. Confirmer la commande
  // ─────────────────────────────────────────
  const handleConfirmer = () => {
    if (!coursierSelectionne || !position) return;

    Alert.alert(
      `Commander avec ${coursierSelectionne.nom}`,
      `Distance : ${coursierSelectionne.distance.toFixed(1)} km\nNote : ${coursierSelectionne.note} ★`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "✅ Confirmer",
          onPress: () =>
            onCommanderAvecCoursier({
              coursierId:  coursierSelectionne.id,
              coursierNom: coursierSelectionne.nom,
              coursierLat: coursierSelectionne.latitude.toString(),
              coursierLon: coursierSelectionne.longitude.toString(),
              clientLat:   position.latitude.toString(),
              clientLon:   position.longitude.toString(),
            }),
        },
      ]
    );
  };

  // ─────────────────────────────────────────
  //  RENDU — état chargement
  // ─────────────────────────────────────────
  if (chargement && !position) {
    return (
      <View style={styles.etatBox}>
        <ActivityIndicator size="large" color="#0A2FCC" />
        <Text style={styles.etatTexte}>Localisation en cours...</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────
  //  RENDU — état erreur
  // ─────────────────────────────────────────
  if (erreur) {
    return (
      <View style={styles.etatBox}>
        <Text style={styles.etatIcone}>📍</Text>
        <Text style={styles.etatErreur}>{erreur}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={geolocalisierClient}>
          <Text style={styles.retryBtnText}>🔄 Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────
  //  RENDU — carte + liste
  // ─────────────────────────────────────────
  return (
    <View style={styles.wrapper}>

      {/* ── CARTE react-native-maps (OpenStreetMap) ── */}
      <View style={styles.mapContainer}>
        {region && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}        // ← OpenStreetMap, pas Google Maps
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}           // on gère le marqueur manuellement
            showsMyLocationButton={false}
            showsCompass={true}
            rotateEnabled={false}
          >
            {/* Marqueur position du client — point bleu */}
            {position && (
              <Marker
                coordinate={position}
                title="Vous êtes ici"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.markerClient}>
                  {/* Anneau extérieur bleu clair */}
                  <View style={styles.markerClientAnneauExt}>
                    {/* Point bleu central */}
                    <View style={styles.markerClientPointBleu} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Cercle rayon 2 km autour du client */}
            {position && (
              <Circle
                center={position}
                radius={RAYON_KM * 1000}
                strokeColor="rgba(10, 47, 204, 0.4)"
                fillColor="rgba(10, 47, 204, 0.06)"
                strokeWidth={1.5}
              />
            )}

            {/* Marqueurs des coursiers disponibles */}
            {coursiers.map((c) => {
              const sel = c.id === coursierSelectionne?.id;
              return (
                <Marker
                  key={c.id}
                  coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                  title={c.nom}
                  description={`${c.distance.toFixed(1)} km · ${c.note} ★`}
                  onPress={() => handleSelectionnerCoursier(c)}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={[styles.markerCoursier, sel && styles.markerCoursierSel]}>
                    <Text style={{ fontSize: 18 }}>🏍️</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>
        )}

        {/* Bouton rafraîchir en surimpression */}
        <TouchableOpacity style={styles.refreshBtn} onPress={geolocalisierClient}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>

        {/* Indicateur chargement en surimpression */}
        {chargement && (
          <View style={styles.overlayLoading}>
            <ActivityIndicator size="small" color="#0A2FCC" />
            <Text style={styles.overlayLoadingText}>Mise à jour...</Text>
          </View>
        )}
      </View>

      {/* ── COMPTEUR ── */}
      <View style={styles.compteurBox}>
        {coursiers.length === 0 ? (
          <View style={styles.aucunBox}>
            <Text style={styles.aucunTexte}>
              😔 Aucun coursier disponible à moins de 2 km
            </Text>
          </View>
        ) : (
          <Text style={styles.compteurTexte}>
            ✅ {coursiers.length} coursier{coursiers.length > 1 ? "s" : ""} disponible{coursiers.length > 1 ? "s" : ""} à moins de {RAYON_KM} km
          </Text>
        )}
      </View>

      {/* ── LISTE DES COURSIERS ── */}
      {coursiers.map((c) => {
        const sel = c.id === coursierSelectionne?.id;
        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.coursierCard, sel && styles.coursierCardSel]}
            onPress={() => handleSelectionnerCoursier(c)}
            activeOpacity={0.85}
          >
            <View style={[styles.coursierAvatar, sel && styles.coursierAvatarSel]}>
              <Text style={{ fontSize: 22 }}>🏍️</Text>
            </View>
            <View style={styles.coursierInfo}>
              <Text style={[styles.coursierNom, sel && { color: "#0A2FCC" }]}>
                {c.nom}
              </Text>
              <Text style={styles.coursierMeta}>
                {c.note} ★ · {c.distance.toFixed(1)} km de vous
              </Text>
            </View>
            <View style={[styles.distBadge, sel && styles.distBadgeSel]}>
              <Text style={[styles.distText, sel && { color: "#fff" }]}>
                {c.distance < 1
                  ? `${Math.round(c.distance * 1000)} m`
                  : `${c.distance.toFixed(1)} km`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* ── BOUTON CONFIRMER ── */}
      {coursierSelectionne && (
        <TouchableOpacity
          style={styles.btnCommander}
          onPress={handleConfirmer}
          activeOpacity={0.85}
        >
          <Text style={styles.btnCommanderText}>
            🏍️ Commander avec {coursierSelectionne.nom} →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },

  // États chargement / erreur
  etatBox: {
    height: 200, borderRadius: 16, backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center", gap: 10,
    padding: 20, marginBottom: 8,
  },
  etatTexte:  { fontSize: 13, color: "#6B7280", fontWeight: "500", textAlign: "center" },
  etatIcone:  { fontSize: 32 },
  etatErreur: { fontSize: 13, color: "#FF4D4D", fontWeight: "500", textAlign: "center", lineHeight: 20 },
  retryBtn:      { backgroundColor: "#0A2FCC", borderRadius: 10, paddingHorizontal: 22, paddingVertical: 9, marginTop: 4 },
  retryBtnText:  { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Carte
  mapContainer: {
    height: 250, borderRadius: 16, overflow: "hidden",
    backgroundColor: "#E8EEF9", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  map: { flex: 1 },

  // Surimpressions sur la carte
  refreshBtn: {
    position: "absolute", top: 10, right: 10,
    width: 36, height: 36, backgroundColor: "#fff", borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 3,
  },
  refreshIcon: { fontSize: 18 },
  overlayLoading: {
    position: "absolute", top: 10, left: 10,
    backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  overlayLoadingText: { fontSize: 11, color: "#0A2FCC", fontWeight: "600" },

  // Marqueurs
  markerClient: {
    width: 44, height: 44,
    alignItems: "center", justifyContent: "center",
  },
  markerClientAnneauExt: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(10, 47, 204, 0.18)",
    borderWidth: 1.5, borderColor: "rgba(10, 47, 204, 0.35)",
    alignItems: "center", justifyContent: "center",
  },
  markerClientPointBleu: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#0A2FCC",
    borderWidth: 2.5, borderColor: "#fff",
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  markerCoursier: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F0FDF4", borderWidth: 2.5, borderColor: "#00C48C",
    alignItems: "center", justifyContent: "center",
  },
  markerCoursierSel: { backgroundColor: "#FFF8ED", borderColor: "#FFB800" },

  // Compteur
  compteurBox:  { marginBottom: 8 },
  compteurTexte:{ fontSize: 12, color: "#374151", fontWeight: "500" },
  aucunBox:     { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, borderWidth: 1, borderColor: "#FECACA" },
  aucunTexte:   { fontSize: 12, color: "#FF4D4D", textAlign: "center", fontWeight: "500" },

  // Cartes coursiers
  coursierCard: {
    backgroundColor: "#fff", borderRadius: 13, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: "transparent", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  coursierCardSel:   { borderColor: "#0A2FCC", backgroundColor: "#EEF2FF" },
  coursierAvatar:    { width: 44, height: 44, borderRadius: 13, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  coursierAvatarSel: { backgroundColor: "#C7D2FE" },
  coursierInfo:      { flex: 1 },
  coursierNom:       { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 2 },
  coursierMeta:      { fontSize: 11, color: "#9CA3AF" },
  distBadge:         { backgroundColor: "#F3F4F6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  distBadgeSel:      { backgroundColor: "#0A2FCC" },
  distText:          { fontSize: 12, fontWeight: "700", color: "#374151" },

  // Bouton commander
  btnCommander: {
    backgroundColor: "#FFB800", borderRadius: 13, paddingVertical: 14,
    alignItems: "center", marginTop: 4, marginBottom: 4,
    shadowColor: "#FFB800", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  btnCommanderText: { fontSize: 14, fontWeight: "800", color: "#080C1A" },
});
