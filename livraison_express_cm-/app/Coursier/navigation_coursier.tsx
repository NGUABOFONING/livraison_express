import UniversalMap from "@/components/UniversalMap.native";
import { supabase } from "../../lib/supabase";

import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function NavigationGPSCoursier() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const router = useRouter();

  //  Données mock (à remplacer par API / DB)

  //  États dynamiques
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [distance, setDistance] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");

  // Point vert clignotant
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Fonction utilitaire Alert (fallback Web)pour web et mobile
  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
      if (onConfirm) onConfirm();
    } else {
      Alert.alert(title, message, [{ text: "OK", onPress: onConfirm }]);
    }
  };

  // CHARGER COURSE

  const chargerCourse = async () => {
    try {
      if (!courseId) return;

      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error || !data) {
        console.log(error);
        return;
      }

      setDelivery(data);
      // charger client
      const { data: clientData } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user_id)
        .single();

      setClient(clientData);
      await calculDistance(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const calculDistance = async (deliveryData: any) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        showAlert(
          "Permission refusée",
          "Impossible d'accéder à votre position.",
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const pickupLat = deliveryData.pickup_latitude;
      const pickupLng = deliveryData.pickup_longitude;
      const R = 6371; // Rayon de la Terre en km
      const dLat = ((pickupLat - latitude) * Math.PI) / 180;
      const dLng = ((pickupLng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((pickupLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      setDistance(Number(dist.toFixed(1)));

      const minutes = Math.round((dist / 12) * 60);

      setDurationMinutes(minutes);

      const now = new Date();

      now.setMinutes(now.getMinutes() + minutes);

      setEstimatedArrival(
        `${now.getHours()}h${String(now.getMinutes()).padStart(2, "0")}`,
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Action "J’ai récupéré le colis"
  const handlePickup = async () => {
    try {
      await supabase
        .from("deliveries")
        .update({
          status: "picked",
        })
        .eq("id", courseId);

      showAlert("Colis récupéré", "Le client a été notifié.");
    } catch (err) {
      console.log(err);
    }
  };
  // LIVRAISON TERMINÉE
  const handleDelivered = async () => {
    try {
      await supabase
        .from("deliveries")
        .update({
          status: "delivered",
        })
        .eq("id", courseId);

      showAlert("Livraison terminée", "Mission terminée avec succès.", () => {
        router.replace("/Coursier/dashboard_coursier");
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    chargerCourse();
  }, []);
  //Loader
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }
  if (!delivery) {
    return (
      <View style={styles.loader}>
        <Text>Course introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Animated.View style={[styles.dot, { opacity }]} />
        <Text style={styles.headerText}>En route vers le client</Text>
        <Text style={styles.distanceText}>{distance} km restants</Text>
      </View>

      {/* ── Carte/Map ── */}
      <View style={styles.mapContainer}>
        <UniversalMap
          pickup_address={{
            latitude: delivery.pickup_latitude,
            longitude: delivery.pickup_longitude,
          }}
          delivery_address={{
            latitude: delivery.delivery_latitude,
            longitude: delivery.delivery_longitude,
          }}
        />
      </View>

      {/* ── Infos temps ── */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          Arrivée estimée : {estimatedArrival}
        </Text>
        <Text style={styles.infoText}>{durationMinutes} MIN</Text>
        <Text style={styles.infoText}>
          Destination : {}
          {delivery.delivery_address.label}
        </Text>
      </View>

      {/* ── Prochaine direction ── */}
      <View style={styles.directionCard}>
        <Text style={styles.directionText}>
          ➡️ Tourner à gauche sur Avenue Kennedy – dans {distance} km
        </Text>
      </View>

      {/* ── Infos client ── */}
      <View style={styles.clientCard}>
        {client?.photoUrl ? (
          <Image source={{ uri: client.photoUrl }} style={styles.clientPhoto} />
        ) : (
          <Text style={styles.clientPhoto}>👤</Text>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{client?.full_name} (Client)</Text>
          <Text style={styles.clientAddress}>
            {delivery.pickup_address.label}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(`sms:${client?.phone}`)}
        >
          <Text style={styles.msgButton}>📩</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bouton action ── */}
      <TouchableOpacity style={styles.btnPickup} onPress={handlePickup}>
        <Text style={styles.btnPickupText}>✅ J’ai récupéré le colis</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnDelivered} onPress={handleDelivered}>
        <Text style={styles.btnPickupText}>📦 Livraison terminée</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8EEF7", padding: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00C853",
    marginRight: 8,
  },
  headerText: { fontSize: 16, fontWeight: "700", flex: 1 },
  distanceText: { fontSize: 14, color: "#4285F4", fontWeight: "600" },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoText: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  directionCard: {
    backgroundColor: "#FFFBF0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  directionText: { fontSize: 14, fontWeight: "700", color: "#FF3B30" },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  clientPhoto: { fontSize: 32, marginRight: 12 },
  clientName: { fontSize: 15, fontWeight: "700" },
  clientAddress: { fontSize: 13, color: "#555" },
  msgButton: { fontSize: 24, marginLeft: 8 },
  btnPickup: {
    backgroundColor: "#00C853",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  btnDelivered: {
    backgroundColor: "#4285F4",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  btnPickupText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
