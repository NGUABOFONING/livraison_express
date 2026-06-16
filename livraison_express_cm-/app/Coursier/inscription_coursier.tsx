
import { decode } from "base64-arraybuffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";

import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

{
  /*definition type document*/
}

type Documents = {
  cni: any | null;
  permis: any | null;
  carteGrise: any | null;
  assurance: any | null;
};

export default function CourierRegistration() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Documents>({
    cni: null,
    permis: null,
    carteGrise: null,
    assurance: null,
  });
  // Indique si l'utilisateur a essayé de soumettre (pour afficher les erreurs)
  const [soumis, setSoumis] = useState(false);

  {
    /*importation des documents*/
  }

  const pickDocument = async (type: keyof Documents) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!result.canceled) {
        setDocuments({ ...documents, [type]: result.assets[0] });
      }
    } catch (err) {
      console.log("Erreur lors de l’importation", err);
    }
  };

  {
    /*champ obligatoire*/
  }
  //permettra de prende un fichier pdf  l'envoyer sur supabase storage et retourner l'url du fichier
  const uploadDocument = async (file: any, folder: string, userId: string) => {
    try {
      /*{console.log("File invalide", file);return null;}*/
      const fileUri = file?.uri || file?.assets?.[0]?.uri;

      if (!fileUri) {
        console.log("Fichier invalide");
        return null;
      }

      console.log("UPLOAD URI:", fileUri);

      const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      //const response = await fetch(file.uri); // il lit le  pdf telecharge
      //const blob = await response.blob(); //transforme le fichier en format uploadable

      const filePath = `${userId}/${folder}-${Date.now()}.pdf`; // cree un chemin unique

      const { error } = await supabase.storage
        .from("profil-riders")
        .upload(filePath, decode(fileBase64), {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error) {
        console.log("Erreur upload:", error.message);
        return null;
      }

      const { data } = supabase.storage
        .from("profil-riders")
        .getPublicUrl(filePath); // retourne l'url du document
      console.log("UPLOAD SUCCESS", data.publicUrl);

      return data.publicUrl;
    } catch (err) {
      console.log("Upload catch:", err);
      return null;
    }
  };
  const handleSubmit = async () => {
    if (
      !nom ||
      !email ||
      Object.values(documents).some((doc) => doc === null)
    ) {
      Alert.alert("Attention", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Erreur", "Utilisateur non connecté.");
        return;
      }

      // 1. UPLOAD des fichiers et chagement en url
      const cniUrl = await uploadDocument(documents.cni, "cni", user.id);
      const permisUrl = await uploadDocument(
        documents.permis,
        "permis",
        user.id,
      );
      const carteGriseUrl = await uploadDocument(
        documents.carteGrise,
        "carteGrise",
        user.id,
      );
      const assuranceUrl = await uploadDocument(
        documents.assurance,
        "assurance",
        user.id,
      );
      if (!cniUrl || !permisUrl || !carteGriseUrl || !assuranceUrl) {
        setLoading(false);
        Alert.alert("Erreur", "Certains documents n'ont pas pu être uploadés.");
        return;
      }

      // 2. UPDATE table users (TES COLONNES EXACTES)
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: nom,
          email: email,
          cni: cniUrl,
          permis: permisUrl,
          carteGrise: carteGriseUrl,
          assurance: assuranceUrl,
          demande_coursier: "en_attente",
        })
        .eq("id", user.id);

      if (updateError) {
        console.log(updateError);
        Alert.alert("Erreur", "Impossible de sauvegarder les données.");
        return;
      }

      console.log("Utilisateur connecté :", user.id);
      router.push({
        pathname: "/Coursier/validation_coursier",
        params: {
          submissionDate: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.log(error);

      Alert.alert("Erreur", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/*title*/}

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        {/*logo*/}
        <View style={styles.logoContainer}>
          <FontAwesome5 name="motorcycle" size={40} color="#000" />
        </View>
        <Text style={styles.headerTitle}>DEVENIR COURSIER</Text>
        <Text style={styles.headerSubtitle}>
          Gagne ta vie avec tes livraisons
        </Text>
      </View>

      {/*remplissage*/}

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nom complet *</Text>
        <TextInput
          style={styles.input}
          placeholder="Jean-Baptiste Kouassi"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@email.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.sectionTitle}>Documents requis *</Text>

        {(Object.keys(documents) as (keyof Documents)[]).map((doc) => (
          <TouchableOpacity
  key={doc}
  style={[
    styles.uploadButton,
    documents[doc] && styles.uploadedButton,
  ]}
  onPress={() => pickDocument(doc)}
>
  <Text style={styles.uploadText}>
    {doc === "cni" && <Ionicons name="id-card" size={18} color="#fff" />}
    {doc === "permis" && <FontAwesome5 name="car" size={18} color="#fff" />}
    {doc === "carteGrise" && <MaterialIcons name="description" size={18} color="#fff" />}
    {doc === "assurance" && <Ionicons name="shield-checkmark" size={18} color="#fff" />}
    {"  "}
    {doc.toUpperCase()}{" "}
    {documents[doc]
      ? `✓ ${documents[doc].name}`
      : "(cliquer pour importer)"}
  </Text>
</TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>
            {loading ? "Envoi en cours..." : "Soumettre ma demande"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.validationMsg}>
          Validation sous 72h max après soumission des documents complet
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#0A2FCC",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },

  container: { flex: 1, backgroundColor: "#050b25" },

  headerSubtitle: { fontSize: 20, color: "#fff", marginTop: 15 },
  form: { padding: 20 },
  label: { marginTop: 10, fontWeight: "600", color: "#adacac" },
  input: {
    borderWidth: 2,
    borderColor: "#4d50f5",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    color: "#f7f4f4",
  },

  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fdf6f6",
  },
  documentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  uploadButton: {
   
    marginTop: 10,
    padding: 15,
    backgroundColor: "#212122",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  uploadedButton: {
    backgroundColor: "#bdfbcc", // vert clair
    borderColor: "green", // bordure verte
  },

  uploadText: { color: "#f9f7f7" },

  submitButton: {
    marginTop: 30,
    backgroundColor: "blue",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  validationMsg: {
    marginTop: 15,
    fontSize: 12,
    color: "#9999af",
    textAlign: "center",
  },

  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoEmoji: {
    fontSize: 52,
  },
});
