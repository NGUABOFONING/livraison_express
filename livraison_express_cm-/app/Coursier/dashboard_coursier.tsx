import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextStyle,
  Dimensions 
} from "react-native";
import { supabase } from "@/lib/supabase";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";


const { width } = Dimensions.get("window");

interface Delivery {
  id: string;
  pickup_address: string;
  delivery_address: string;
  created_at: string;
  price: number;
  status: string;
}

export default function DashboardCoursier() {
  const [online, setOnline] = useState(true);
  const [solde, setSolde] = useState(0);
  const [stats, setStats] = useState({ deliveries: 0, gains: 0, note: 0, heures: 0 });
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [nomCoursier, setNomCoursier] = useState(""); // 🔹 Nom du coursier
  const [prenomCoursier, setPrenomCoursier] = useState(""); // 🔹 Prénom du coursier

  // Animation point clignotant
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user) {
        Alert.alert("Erreur", "Impossible de récupérer l'utilisateur connecté.");
        return;
      }

      const user = data.user;

      // 🔹 Stocker l'heure de connexion
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("riders")
        .update({ heure_connexion: now })
        .eq("id", user.id);

      if (updateError) {
        Alert.alert("Erreur", "Impossible de mettre à jour l'heure de connexion.");
      }

      // 🔹 Infos coursier
      const { data: rider, error: riderError } = await supabase
        .from("riders")
        .select("nom, prenom, nb_courses, note_moyenne, gains, heures_en_ligne")
        .eq("id", user.id)
        .single();

      if (riderError || !rider) {
        Alert.alert("Erreur", "Impossible de charger les informations du coursier.");
      } else {
        setNomCoursier(rider.nom || "Coursier");
        setPrenomCoursier(rider.prenom || "");
        setSolde(rider.gains || 0);
        setStats({
          deliveries: rider.nb_courses || 0,
          gains: rider.gains || 0,
          note: Number(rider.note_moyenne || 0),
          heures: rider.heures_en_ligne ? Number(rider.heures_en_ligne) : 0,
        });
      }

      // 🔹 Dernières livraisons
      const { data: lastCourses, error: deliveriesError } = await supabase
        .from("deliveries")
        .select("id, pickup_address, delivery_address, created_at, price, status")
        .eq("rider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (deliveriesError) {
        Alert.alert("Erreur", "Impossible de charger les livraisons.");
      } else {
        setDeliveries(lastCourses || []);
      }
    };

    fetchData();
  }, []);

  // 🔹 Fonction pour colorer les statuts
  const getStatusColor = (status: string): TextStyle => {
   switch (status.toLowerCase()) {
     case "livré":
        return { color: "#27AE60", fontWeight: "bold" }; // vert
     case "en cours":
        return { color: "#F39C12", fontWeight: "bold" }; // orange
      case "annulé":
        return { color: "#C0392B", fontWeight: "bold" }; // rouge
      default:
        return { color: "#000", fontWeight: "normal" };
   }
  };

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 20, duration: 300, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -20, duration: 300, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-20, 20],
    outputRange: ["-20deg", "20deg"],
  });
  

  return (
    <>
      <View style={styles.container}>
        {/* 🔹 En-tête */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: online ? "#414143" : "#C0392B" }]}
              onPress={() => setOnline(!online)}
            >
              <View style={styles.statusRow}>
                <Animated.View
                  style={[
                    styles.blinkDot,
                    { backgroundColor: online ? "#27AE60" : "#C0392B", opacity: blinkAnim },
                  ]}
                />
                <Text style={styles.statusText}>{online ? "En ligne" : "Déconnecté"}</Text>
              </View>
            </TouchableOpacity>
            <View> 
              <Text style={styles.name}>{nomCoursier} {prenomCoursier} </Text>
              <Animated.View style={{ transform: [{ rotate }] }}>
              <Icon name="hand-paper-o" size={60} color="orange" />
              </Animated.View>
            </View>
            
          </View>

          {/* 🔹 Solde */}
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Mon Solde</Text>
            <Text style={styles.balanceText}>{solde} FCFA</Text>
            <TouchableOpacity style={styles.retraitBtn}>
              <Text style={styles.retraitText}>Retrait MoMo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* 🔹 Statistiques */}
          <View style={styles.statsBox}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.deliveries}</Text>
              <Text style={styles.statLabel}>Commandes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.gains} FCFA</Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.note.toFixed(1)}</Text>
              <Text style={styles.statLabel}>⭐ Note moy.</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.heures}</Text>
              <Text style={styles.statLabel}>Heures en ligne</Text>
            </View>
          </View>

          {/* 🔹 Dernières Commandes */}
          <Text style={styles.sectionTitle}>Dernières Commandes</Text>
          <FlatList
            data={deliveries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.courseItem}>
                <View>
                  <Text>{item.pickup_address} → {item.delivery_address}</Text>
                  <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
                  <Text style={styles.gain}>{item.price} FCFA</Text>
                  <Text style={getStatusColor(item.status)}>Statut : {item.status}</Text>
                </View>
              </View>
            )}
          />
        </ScrollView>
      </View>
  
    {/* Navigation bas */}
        {/* Navigation bas */}
      <View style={styles.navbar}>
        {/* Accueil */}
        <TouchableOpacity onPress={() => router.push("/Coursier/dashboard_coursier")}>
         <FontAwesome name="home" size={24} color="#141428" />
         <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        {/* Carte */}
        <TouchableOpacity onPress={() => router.push("/#")}>
         <Ionicons name="map-outline" size={24} color="#141428" />
         <Text style={styles.navText}>Carte</Text>
        </TouchableOpacity>

       {/* Gains */}
        <TouchableOpacity onPress={() => router.push("/Coursier/Mes_gains")}>
         <FontAwesome name="money" size={24} color="#141428" />
         <Text style={styles.navText}>Gains</Text>
       </TouchableOpacity>

        {/* Profil */}
        <TouchableOpacity onPress={() => router.push("/Coursier/profil_coursier")}>
          <Ionicons name="person-circle-outline" size={24} color="#141428" />
          <Text style={styles.navText}>Profil</Text>
       </TouchableOpacity>

       {/* Déconnexion */}
        <TouchableOpacity onPress={() => router.push("/#")}>
          <MaterialIcons name="logout" size={24} color="red" />
         <Text style={[styles.navText, { color: "red" }]}>Déconnexion</Text>
       </TouchableOpacity>
     </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#0a0a31",
    flexDirection: "row",
    justifyContent: "space-between", // 🔹 espace entre nom et solde
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerLeft: { flexDirection: "column", alignItems: "flex-start" },
  name: {
    fontSize: width < 400 ? 20 : 28, // 🔹 taille réduite sur mobile
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  statusBtn: {
    borderBottomWidth: 1,
    padding: width < 400 ? 4 : 6,
    borderRadius: 20,
    marginTop: 10,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  blinkDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { color: "#327749", fontWeight: "bold" },
  balanceBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0d0d3b",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: width < 400 ? 20 : 40,
    borderRadius: 20,
    marginLeft: 16,
  },
  balanceLabel: { fontSize: 15, fontWeight: "bold", color: "#68666e" },
  balanceText: {
    fontSize: width < 400 ? 40 : 70,
    fontWeight: "bold",
    color: "#e39323",
    marginTop: 4,
    textAlign: "center",
  },
  retraitBtn: {
    marginTop: 8,
    backgroundColor: "#e39323",
    padding: width < 400 ? 6 : 10,
    borderRadius: 15,
  },
  retraitText: {
    color: "#060606",
    fontWeight: "bold",
    fontSize: width < 400 ? 14 : 20,
  },
  statsBox: {
    flexDirection: width < 600 ? "column" : "row", // 🔹 colonne sur mobile
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f3efef",
    padding: width < 400 ? 20 : 40,
    borderWidth: 1,
    borderColor: "#e39323",
    borderRadius: 20,
    marginBottom: width < 600 ? 12 : 0,
    marginHorizontal: width < 600 ? 0 : 8,
  },
  statValue: {
    fontSize: width < 400 ? 14 : 18,
    fontWeight: "bold",
    color: "#e39323",
  },
  statLabel: { fontSize: width < 400 ? 12 : 14, color: "#070808" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginVertical: 8 },
  courseItem: { flexDirection: "row", marginBottom: 12, alignItems: "center" },
  gain: { color: "#27AE60", fontWeight: "bold" },
  navText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#141428",
  },
  navbar: {
    flexDirection: "row",
    paddingBottom: 50,
    justifyContent: "space-around",
    padding: width < 400 ? 8 : 12,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
});
