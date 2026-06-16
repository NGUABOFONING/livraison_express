import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter, } from "expo-router"; // ✅ Récupère l’ID passé en paramètre
//import { Float } from "react-native/Libraries/Types/CodegenTypes";
import UniversalMap from "@/components/UniversalMap.native"; // ✅ Composant universel (Web + Mobile)

const { height } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────
interface CourseData {
  id: string;
  isExpress: boolean;
  distance: number;
  durationMinutes: number;
  prixFCFA: number;
  gainFCFA: number;
  pickup_address: {
    label: string;
    latitude: number;
    longitude: number;
    photoUrl: string | null;
  };
  delivery_address: {
    label: string;
    latitude: number;
    longitude: number;
    photoUrl: string | null;
  };

  colis: { description: string; photoUrl: string | null };
}

// ─── Blinking dot ─────────────────────────────────────────────────────────────
const BlinkingDot: React.FC<{ color: string }> = ({ color }) => {
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
  }, [opacity]);
  return (
    <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function NotificationCoursier() {
  const router = useRouter(); //  initialise le router
  // Récupération de l’ID depuis l’URL
  const { id } = useLocalSearchParams<{ id?: string }>();


  const rawId = Array.isArray(id) ? id[0] : id;

  if (!rawId) {
    return <Text>Erreur: aucun ID fourni</Text>;
  }

  // Mock de données
  const courseData: CourseData = {
    id: rawId,
    isExpress: true,
    distance: 3.2,
    durationMinutes: 22,
    prixFCFA: 1760,
    gainFCFA: 1408,
    pickup_address: {
      label: "Rue Melen, Yaoundé",
      latitude: 3.8667,
      longitude: 11.5167,
      photoUrl: null,
    },
    delivery_address: {
      label: "Bastos, Yaoundé",
      latitude: 3.8667,
      longitude: 11.5167,
      photoUrl: null,
    },

    colis: {
      description: "Documents administratifs — fragile",
      photoUrl: null,
    },
  };

  //  Countdown

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ Animation cloche 🔔
  const bellShake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellShake, {
          toValue: 8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 5,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: -5,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]),
    ).start();
  }, [bellShake]);

  // ✅ Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  // ✅ Expiration
  useEffect(() => {
    if (expired) {
      showAlert(
        "Temps de réponse épuisé",
        "Vous ne pouvez plus accepter cette demande.",
        () => {
          // ✅ Redirection automatique après expiration
          router.push("/Coursier/profil_coursier");
        },
      );
    }
  }, [expired]);

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

  // ✅ Actions
  const handleAccept = () => {
    clearInterval(timerRef.current!);
    showAlert("Course acceptée", `ID: ${courseData.id}`, () =>
      router.push("/Coursier/navigation_coursier"),
    );
  };

  const handleRefuse = () => {
    clearInterval(timerRef.current!);
    showAlert("Course refusée", "Vous avez refusé la course.", () =>
      router.push("/Coursier/profil_coursier"),
    );
  };

  const formatTime = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  

  return (
    <>
      <ScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* ── Header ── */}
        <View style={styles.header}>
          <Animated.Text
            style={[
              styles.bellIcon,
              {
                transform: [
                  {
                    rotate: bellShake.interpolate({
                      inputRange: [-8, 8],
                      outputRange: ["-15deg", "15deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            🔔
          </Animated.Text>
          <Text style={styles.headerTitle}>NOUVELLE COURSE !</Text>
          {courseData.isExpress && (
            <View style={styles.expressBadge}>
              <Text style={styles.expressText}>⚡ EXPRESS</Text>
            </View>
          )}
        </View>

        {/* ── Map universelle ── */}
        <View style={styles.mapContainer}>
          <UniversalMap
            pickup_address={courseData.pickup_address}
            delivery_address={courseData.delivery_address}
          />
        </View>

        {/* ── Détails de la course ── */}
        <View style={styles.card}>
          <View style={styles.cardheader}>
            <Text style={styles.cardHeader}>Détails de la course</Text>
            <Text style={styles.distanceText}>
              {courseData.distance.toFixed(1)} km
            </Text>
          </View>
          {/* Adresses */}
          <View style={styles.addressRow}>
            <BlinkingDot color="#00C853" />
            <Text style={styles.addressText}>
              {courseData.pickup_address.label}
            </Text>
          </View>
          <View style={styles.addressRow}>
            <BlinkingDot color="#FF3B30" />
            <Text style={styles.addressText}>
              {courseData.delivery_address.label}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {courseData.prixFCFA.toLocaleString("fr-FR")}
              </Text>
              <Text style={styles.statLabel}>FCFA prix</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.gainValue]}>
                {courseData.gainFCFA.toLocaleString("fr-FR")}
              </Text>
              <Text style={styles.statLabel}>FCFA gain</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {courseData.durationMinutes}min
              </Text>
              <Text style={styles.statLabel}>estimé</Text>
            </View>
          </View>

          {/* Colis */}
          <View style={styles.colisRow}>
            {courseData.colis.photoUrl ? (
              <Image
                source={{ uri: courseData.colis.photoUrl }}
                style={styles.colisPhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.colisPhotoPlaceholder}>
                <Text style={styles.colisPhotoIcon}>📦</Text>
              </View>
            )}
            <Text style={styles.colisDesc} numberOfLines={2}>
              {courseData.colis.description}
            </Text>
          </View>

          {/* Boutons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btnRefuse, expired && { opacity: 0.5 }]}
              onPress={handleRefuse}
              disabled={expired} // ✅ désactive si expiré
            >
              <Text style={styles.btnRefuseText}>✕ Refuser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAccept, expired && { opacity: 0.5 }]}
              onPress={handleAccept}
              disabled={expired} // ✅ désactive si expiré
            >
              <Text style={styles.btnAcceptText}>✓ Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Countdown ── */}
      <View style={styles.countdownBar}>
        <Text style={styles.countdownLabel}>⏱ Accepte dans</Text>
        <Text style={styles.countdownValue}>{formatTime(secondsLeft)}</Text>
      </View>
      
    </>
  );
}

// ─── Styles  ────────────────────────────────────────────────

const BLUE = "#4285F4";
const GREEN = "#00C853";
const RED = "#FF3B30";
const DARK = "#1A1A2E";
const CARD_BG = "#FFFFFF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8EEF7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  bellIcon: { fontSize: 22 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "800" },
  expressBadge: {
    backgroundColor: "#FFC107",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  expressText: { fontSize: 12, fontWeight: "700" },
  mapContainer: {
    height: height * 0.35,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 15,
    elevation: 3,
    borderColor: BLUE,
    borderWidth: 2,
  },
  cardheader: {
    justifyContent: "space-between",
    textAlignVertical: "auto",
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    padding: 40,
  },

  cardHeader: {
    fontSize: 13,

    fontWeight: "700",
    color: "#f8f4f4",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#e2d8d8",
  },

  // Addresses
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    marginLeft: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
  },
  addressDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 22,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FF",
    borderRadius: 12,
    paddingVertical: 12,
    marginVertical: 14,
    marginLeft: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E0E0E0",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: DARK,
    letterSpacing: 0.3,
  },
  gainValue: {
    color: GREEN,
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },

  // Colis
  colisRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFBF0",
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC107",
    marginBottom: 16,
    marginLeft: 20,
  },
  colisPhoto: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  colisPhotoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#FFF0CC",
    alignItems: "center",
    justifyContent: "center",
  },
  colisPhotoIcon: {
    fontSize: 26,
  },
  colisDesc: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
    lineHeight: 19,
  },

  // Buttons
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    marginLeft: 20,
    marginRight: 20,
  },
  btnRefuse: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
  },
  btnRefuseText: {
    color: RED,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  btnAccept: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnAcceptText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Countdown
  countdownBar: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CARD_BG,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: RED,
  },
  countdownLabel: {
    fontSize: 13,
    color: RED,
    fontWeight: "500",
  },
  countdownValue: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: RED,
  },
});
