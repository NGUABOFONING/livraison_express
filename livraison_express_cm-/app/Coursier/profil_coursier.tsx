import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  Platform, 
} from "react-native";
import { supabase } from "@/lib/supabase";

import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";

export default function ProfilCoursier() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [rider, setRider] = useState<any>(null);

  // 🔹 Fonction utilitaire pour afficher une alerte sur mobile ET web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title} - ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
  (async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();

    //  Récupérer l'utilisateur connecté
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      showAlert("Erreur", "Impossible de récupérer l'utilisateur connecté.");
      return;
    }

    const user = data.user;
    console.log("Utilisateur connecté:", user); // 🔹 Debug

    // Charger les infos du coursier depuis la table riders
    const { data: riderData, error } = await supabase
      .from("riders")
      .select("nom, prenom, telephone, Ville, created_at, cni, permis, carteGrise, assurance, nb_courses, note_moyenne, photoUri")
      .eq("id", user.id) //  Vérifie que 'id' correspond bien à la FK vers users.id
      .single();

    console.log("Résultat riderData:", riderData, "Erreur:", error); // 🔹 Debug

    if (error || !riderData) {
      showAlert("Erreur", "Impossible de charger les informations du coursier.");
    } else {
      setRider(riderData);
      setPhotoUri(riderData?.photoUri || null);
    }
  })();
}, []);

 const pickImageFromGallery = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (!result.canceled) {
    setPhotoUri(result.assets[0].uri);

    // 🔹 Mettre à jour ou insérer la photo dans Supabase
    const { data, error: userError } = await supabase.auth.getUser();
    if (userError || !data.user) {
      showAlert("Erreur", "Impossible de récupérer l'utilisateur connecté.");
      return;
    }

    const user = data.user;

    const { error } = await supabase
      .from("riders")
      .upsert({ id: user.id, photoUri: result.assets[0].uri }) // 🔹 upsert au lieu de update
      .eq("id", user.id);

    if (error) {
      console.log("Erreur upsert photo:", error);
      showAlert("Erreur", "Impossible de sauvegarder la photo.");
    } else {
      showAlert("Succès", "Photo sauvegardée avec succès !");
    }
  }
};



  if (!rider) return null;

  return (
    <>
<View style={styles.header}>
  <TouchableOpacity onPress={pickImageFromGallery}>
    <Image
      source={{ uri: photoUri || "https://via.placeholder.com/100" }}
      style={styles.avatar}
    />
    <Text style={styles.editPhoto}>Modifier la photo</Text>
  </TouchableOpacity>
  <Text style={styles.name}>{rider.nom} {rider.prenom}</Text>
  <Text style={styles.info}>
    Coursier depuis {new Date(rider.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} - {rider.ville}
  </Text>

  {/* Encadré statistiques */}
  <View style={styles.statsBox}>
    <Text style={styles.statsItem}>
      <FontAwesome name="motorcycle" size={20} color="#edd8a4" /> {rider.nb_courses} Livraisons
    </Text>
    <Text style={styles.statsItem}>
      <Ionicons name="star" size={20} color="#edd8a4" /> {rider.note_moyenne?.toFixed(1)} Moyenne
    </Text>
  </View>
</View>

<ScrollView contentContainerStyle={styles.container}>
  {/* Mes documents */}
  <View style={styles.sectionBox}>
    <Text style={styles.sectionTitle}>
      <MaterialIcons name="folder" size={20} color="#040303" /> Mes documents
    </Text>
    {rider.cni && <Text style={styles.docText}><MaterialIcons name="check-circle" size={18} color="green" /> Carte Nationale d'Identité</Text>}
    {rider.permis && <Text style={styles.docText}><MaterialIcons name="check-circle" size={18} color="green" /> Permis de conduire</Text>}
    {rider.carteGrise && <Text style={styles.docText}><MaterialIcons name="check-circle" size={18} color="green" /> Carte grise</Text>}
    {rider.assurance && <Text style={styles.docText}><MaterialIcons name="check-circle" size={18} color="green" /> Assurance</Text>}
  </View>

  {/* Mon compte */}
  <View style={styles.sectionBox}>
    <Text style={styles.sectionTitle}>
      <Ionicons name="person-circle" size={20} color="#040303" /> Mon compte
    </Text>
    <TouchableOpacity style={styles.button}>
      <Ionicons name="call" size={18} color="#000" /> 
      <Text> {rider.telephone}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push("/Coursier/notification_coursier")}
    >
      <Ionicons name="notifications" size={18} color="#000" /> 
      <Text> Notifications</Text>
    </TouchableOpacity>
  </View>

  {/* Aide */}
  <View style={styles.sectionBox}>
    <Text style={styles.sectionTitle}>
      <Ionicons name="help-circle" size={20} color="#040303" /> Aide
    </Text>
    <TouchableOpacity style={styles.button}>
      <Ionicons name="chatbubbles" size={18} color="#000" /> 
      <Text> Support LEC</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push("/Coursier/Mes_gains")}
    >
      <Ionicons name="stats-chart" size={18} color="#000" /> 
      <Text> Mes statistiques</Text>
    </TouchableOpacity>
  </View>
</ScrollView>
      {/* Navigation bas */}
      <View style={styles.navBar}>
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
  container: { padding: 20, backgroundColor: "#fcfcfd" },
  header: { alignItems: "center", marginBottom: 20, backgroundColor: "#141428", paddingTop: 40, paddingBottom: 30, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 5, borderWidth: 2, borderColor: "#fff" },
  editPhoto: { color: "#ccc", fontSize: 14, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  info: { color: "#ccc", marginTop: 5 },
  statsBox: { flexDirection: "row", justifyContent: "space-around", padding: 10, borderRadius: 10, marginTop: 10, width: "100%" },
  statsItem: { color: "#faf9f9", fontWeight: "800", fontSize: 20, borderWidth: 1, borderColor: "#edd8a4", borderRadius: 20, padding: 30, backgroundColor: "#2f3036" },
  sectionBox: { backgroundColor: "#f1f5f5", padding: 15, borderRadius: 20, marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#040303", marginBottom: 10 },
  docText: { color: "#0e0d0d", marginVertical: 5 },
  button: { backgroundColor: "#f1f5f5", padding: 12, marginVertical: 5 },
  
  navText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    color: "#141428",
  },
  navBar: { flexDirection: "row", justifyContent: "space-around", marginTop: 20, backgroundColor: "#fcfcfd", padding: 10, paddingBottom: 50, borderRadius: 10 },
});
