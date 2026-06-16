import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
//import countryData from "react-native-country-picker-modal/lib/data";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import countries from "world-countries";
import { supabase } from "../../lib/supabase";

type PaysType = {
  code: string;
  drapeau: string;
  nom: string;
};

const PAYS: PaysType[] = countries
  .filter(
    (country: any) =>
      country.idd && country.idd.root && country.idd.suffixes?.length,
  )
  .map((country: any) => ({
    code: `${country.idd.root}${country.idd.suffixes[0]}`,
    drapeau: country.flag || "🏳️",
    nom: country.translations?.fra?.common || country.name.common,
  }))
  .sort((a, b) => a.nom.localeCompare(b.nom));
// ─────────────────────────────────────────────
//  LOGOS SVG OFFICIELS
// ─────────────────────────────────────────────
function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}
function FacebookLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </Svg>
  );
}
function AppleLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 814 1000">
      <Path
        fill="#000000"
        d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 327.1 0 203.8 0 87.7c0-66.2 12.7-130.1 48.4-185.5 50-81.5 128.6-133.6 214.2-135.1 67.2-1.5 130.5 44.1 173.4 44.1 43 0 124.6-55.4 203.5-55.4 32.7 0 133.2 12.7 199.6 96.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
//  LABELS
// ─────────────────────────────────────────────
function LabelObligatoire({ texte }: { texte: string }) {
  return (
    <View style={labelStyles.row}>
      <Text style={labelStyles.text}>{texte}</Text>
      <Text style={labelStyles.etoile}> *</Text>
    </View>
  );
}
function LabelFacultatif({ texte }: { texte: string }) {
  return (
    <View style={labelStyles.row}>
      <Text style={labelStyles.text}>{texte}</Text>
      <Text style={labelStyles.facultatif}> (facultatif)</Text>
    </View>
  );
}
const labelStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 7,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  etoile: { fontSize: 14, fontWeight: "800", color: "#FF4D4D", lineHeight: 16 },
  facultatif: { fontSize: 10, color: "#9CA3AF", fontStyle: "italic" },
});

// ─────────────────────────────────────────────
//  COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function InscriptionScreen() {
  const [paysSelectionne, setPaysSelectionne] = useState<PaysType>(
    PAYS.find((p) => p.code === "+237") || PAYS[0],
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [genre, setGenre] = useState("");
  const [telephone, setTelephone] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [recherche, setRecherche] = useState("");
  const [nomFocused, setNomFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [telFocused, setTelFocused] = useState(false);
  const [soumis, setSoumis] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const paysFiltres = PAYS.filter((p) => {
    const rechercheLower = recherche.toLowerCase().trim();

    return (
      p.nom.toLowerCase().includes(rechercheLower) ||
      p.code.includes(rechercheLower)
    );
  });

  const emailValide = email.includes("@") && email.includes(".");
  const nomValide = nom.trim().length > 2;
  const telValide = telephone.length >= 6;
  const formulaireValide = nomValide && emailValide && telValide;

  // ── Sélecteur de photo (locale uniquement, non enregistrée en base) ──
  const handleChoisirPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission refusée",
        "Active l'accès à la galerie dans les paramètres.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType;
      if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
        Alert.alert(
          "Format non supporté",
          "Veuillez choisir une image .jpg, .jpeg ou .png",
        );
        return;
      }
      setPhotoUri(asset.uri);
    }
  };

  // ── Soumission formulaire (email OTP) ──
  const handleSoumettre = async () => {
    setSoumis(true);
    if (!formulaireValide) return;
    setChargement(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        if (error.message.includes("rate limit")) {
          Alert.alert(
            "Trop de tentatives",
            "Veuillez réessayer dans quelques minutes.",
          );
          return;
        }
        Alert.alert("Erreur", error.message);
        return;
      }
      router.push({
        pathname: "./File_client/verification-OTP",
        params: {
          email,
          nom,
          telephone: `${paysSelectionne.code} ${telephone}`,
          country: paysSelectionne.nom, // Ajout de la partie pays par le backend
          genre: genre,
        },
      });
    } catch (err) {
      console.log("Erreur générale:", err);
    } finally {
      setChargement(false);
    }
  };

  // ── Helper interne : écoute session après OAuth ──
  const ecouterSession = () => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          listener.subscription.unsubscribe();
          router.replace("./File_client/accueil-client");
        }
      },
    );
  };

  // ── OAuth Google → accueil direct ──
  const handleGoogle = async () => {
    setChargement(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { skipBrowserRedirect: false },
      });
      if (error) {
        Alert.alert("Erreur Google", error.message);
        return;
      }
      ecouterSession();
    } catch (err) {
      console.log("Erreur Google:", err);
    } finally {
      setChargement(false);
    }
  };

  // ── OAuth Facebook → accueil direct ──
  const handleFacebook = async () => {
    setChargement(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { skipBrowserRedirect: false },
      });
      if (error) {
        Alert.alert("Erreur Facebook", error.message);
        return;
      }
      ecouterSession();
    } catch (err) {
      console.log("Erreur Facebook:", err);
    } finally {
      setChargement(false);
    }
  };

  // ── OAuth Apple → accueil direct ──
  const handleApple = async () => {
    setChargement(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { skipBrowserRedirect: false },
      });
      if (error) {
        Alert.alert("Erreur Apple", error.message);
        return;
      }
      ecouterSession();
    } catch (err) {
      console.log("Erreur Apple:", err);
    } finally {
      setChargement(false);
    }
  };

  // ── RENDU ──
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2FCC" />

      {/* ══ MODAL SÉLECTION PAYS ══ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌍 Choisir un pays</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => {
                  setModalVisible(false);
                  setRecherche("");
                }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Rechercher un pays ou un indicatif..."
                placeholderTextColor="#9CA3AF"
                value={recherche}
                onChangeText={setRecherche}
              />
              {recherche.length > 0 && (
                <TouchableOpacity onPress={() => setRecherche("")}>
                  <Text
                    style={{ fontSize: 14, color: "#9CA3AF", paddingRight: 8 }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.modalResultCount}>
              {paysFiltres.length} pays disponible
              {paysFiltres.length > 1 ? "s" : ""}
            </Text>
            <FlatList
              data={paysFiltres}
              keyExtractor={(item) => item.code + item.nom}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const sel =
                  paysSelectionne.code === item.code &&
                  paysSelectionne.nom === item.nom;
                return (
                  <TouchableOpacity
                    style={[styles.paysItem, sel && styles.paysItemSelected]}
                    onPress={() => {
                      setPaysSelectionne(item);
                      setModalVisible(false);
                      setRecherche("");
                    }}
                  >
                    <Text style={styles.paysDrapeau}>{item.drapeau}</Text>
                    <Text
                      style={[styles.paysNom, sel && styles.paysNomSelected]}
                    >
                      {item.nom}
                    </Text>
                    <View
                      style={[
                        styles.paysCodeBadge,
                        sel && styles.paysCodeBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paysCode,
                          sel && styles.paysCodeSelected,
                        ]}
                      >
                        {item.code}
                      </Text>
                    </View>
                    {sel && <Text style={styles.paysCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchIcon}>🔍</Text>
                  <Text style={styles.emptySearchText}>
                    Aucun pays trouvé pour "{recherche}"
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ══ EN-TÊTE BLEUE ══ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un compte</Text>
        <Text style={styles.headerSub}>Rejoins Livraison Express CM</Text>
      </View>

      {/* ══ FORMULAIRE ══ */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.obligatoireNote}>
          <Text style={styles.obligatoireEtoile}>*</Text>
          <Text style={styles.obligatoireTexte}>
            {" "}
            Les champs marqués d'une étoile sont obligatoires
          </Text>
        </View>

        {/* ── PHOTO (locale, non enregistrée en base de données) ── */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={handleChoisirPhoto}
            activeOpacity={0.8}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarCameraIcon}>📷</Text>
                <Text style={styles.avatarPlusText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {photoUri
              ? "Appuie pour changer la photo"
              : "Appuie pour ajouter une photo"}
          </Text>
          <Text style={styles.avatarFormats}>
            Formats acceptés : .jpg · .jpeg · .png
          </Text>
        </View>

        {/* ── NOM ── */}
        <LabelObligatoire texte="Nom complet" />
        <View
          style={[
            styles.inputRow,
            nomFocused && styles.inputRowFocused,
            soumis && !nomValide && styles.inputRowError,
          ]}
        >
          <Text style={styles.inputIcon}>👤</Text>
          <View style={styles.inputDivider} />
          <TextInput
            style={styles.input}
            placeholder="Ex : Paul Mbarga"
            placeholderTextColor="#9CA3AF"
            value={nom}
            onChangeText={setNom}
            onFocus={() => setNomFocused(true)}
            onBlur={() => setNomFocused(false)}
          />
          {nomValide && <Text style={styles.validIcon}>✓</Text>}
        </View>
        {soumis && !nomValide && (
          <Text style={styles.erreurMsg}>
            ⚠️ Veuillez entrer votre nom complet
          </Text>
        )}

        {/* ── EMAIL ── */}
        <LabelObligatoire texte="Adresse email" />
        <View
          style={[
            styles.inputRow,
            emailFocused && styles.inputRowFocused,
            soumis && !emailValide && styles.inputRowError,
          ]}
        >
          <Text style={styles.inputIcon}>✉️</Text>
          <View style={styles.inputDivider} />
          <TextInput
            style={styles.input}
            placeholder="exemple@gmail.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
          {emailValide && <Text style={styles.validIcon}>✓</Text>}
        </View>
        {soumis && !emailValide && (
          <Text style={styles.erreurMsg}>
            ⚠️ Veuillez entrer un email valide
          </Text>
        )}

        {/* ── TÉLÉPHONE ── */}
        <LabelObligatoire texte="Numéro de téléphone" />
        <View
          style={[
            styles.phoneRow,
            telFocused && styles.phoneRowFocused,
            soumis && !telValide && styles.inputRowError,
          ]}
        >
          <TouchableOpacity
            style={styles.flagBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.flagDrapeau}>{paysSelectionne.drapeau}</Text>
            <Text style={styles.flagCode}>{paysSelectionne.code}</Text>
            <Text style={styles.flagArrow}>▾</Text>
          </TouchableOpacity>
          <View style={styles.phoneDivider} />
          <TextInput
            style={styles.phoneInput}
            placeholder="6 71 23 45 67"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={telephone}
            onChangeText={setTelephone}
            onFocus={() => setTelFocused(true)}
            onBlur={() => setTelFocused(false)}
          />
          {telValide && <Text style={styles.validIcon}>✓</Text>}
        </View>
        {soumis && !telValide && (
          <Text style={styles.erreurMsg}>
            ⚠️ Veuillez entrer un numéro valide
          </Text>
        )}
        {telephone.length > 0 && (
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              📱 Numéro complet : {paysSelectionne.code} {telephone}
            </Text>
          </View>
        )}

        {/* ── GENRE (FACULTATIF) ── */}
        <LabelFacultatif texte="Genre" />
        <View style={styles.genderRow}>
          {[
            { key: "homme", label: "👨 Homme" },
            { key: "femme", label: "👩 Femme" },
            { key: "autre", label: "— Autre" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.genderOpt,
                genre === opt.key && styles.genderOptSel,
              ]}
              onPress={() => setGenre(opt.key)}
            >
              <Text
                style={[
                  styles.genderOptText,
                  genre === opt.key && styles.genderOptTextSel,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── BOUTON CRÉER ── */}
        <TouchableOpacity
          style={[
            styles.btnBlue,
            (!formulaireValide || chargement) && styles.btnBlueDisabled,
          ]}
          onPress={handleSoumettre}
          activeOpacity={0.8}
          disabled={chargement}
        >
          {chargement ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnBlueText}>Créer mon compte →</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          En continuant, tu acceptes nos{" "}
          <Text style={styles.link}>Conditions</Text> et notre{" "}
          <Text style={styles.link}>Politique de confidentialité</Text>
        </Text>

        <Text style={styles.already}>
          Déjà inscrit ?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/File_client/connexion")}
          >
            Se connecter
          </Text>
        </Text>

        {/* ── SÉPARATEUR ── */}
        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou continuer avec</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* ── GOOGLE → accueil direct ── */}
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={handleGoogle}
          activeOpacity={0.8}
          disabled={chargement}
        >
          <View style={styles.socialLogoBox}>
            <GoogleLogo size={22} />
          </View>
          <Text style={styles.socialBtnText}>Continuer avec Google</Text>
        </TouchableOpacity>

        {/* ── FACEBOOK → accueil direct ── */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.facebookBtn]}
          onPress={handleFacebook}
          activeOpacity={0.8}
          disabled={chargement}
        >
          <View style={styles.socialLogoBox}>
            <FacebookLogo size={22} />
          </View>
          <Text style={[styles.socialBtnText, styles.facebookBtnText]}>
            Continuer avec Facebook
          </Text>
        </TouchableOpacity>

        {/* ── APPLE → accueil direct ── */}
        <TouchableOpacity
          style={[styles.socialBtn, styles.appleBtn]}
          onPress={handleApple}
          activeOpacity={0.8}
          disabled={chargement}
        >
          <View style={styles.socialLogoBox}>
            <AppleLogo size={22} />
          </View>
          <Text style={[styles.socialBtnText, styles.appleBtnText]}>
            Continuer avec Apple
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  obligatoireNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  obligatoireEtoile: { fontSize: 14, fontWeight: "800", color: "#FF4D4D" },
  obligatoireTexte: { fontSize: 11, color: "#FF4D4D", fontWeight: "500" },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  facebookBtn: { borderColor: "#1877F2", backgroundColor: "#F0F7FF" },
  appleBtn: { borderColor: "#222", backgroundColor: "#F9FAFB" },
  socialLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E4DF",
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  facebookBtnText: { color: "#1877F2" },
  appleBtnText: { color: "#111827" },
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
    gap: 10,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#E5E4DF" },
  separatorText: { fontSize: 11, color: "#9CA3AF", fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    maxHeight: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 17, fontWeight: "800", color: "#111827" },
  modalClose: {
    width: 32,
    height: 32,
    backgroundColor: "#F3F4F6",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  modalSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginHorizontal: 14,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    gap: 8,
  },
  modalSearchIcon: { fontSize: 16 },
  modalSearchInput: { flex: 1, fontSize: 14, color: "#111827" },
  modalResultCount: {
    fontSize: 11,
    color: "#9CA3AF",
    paddingHorizontal: 18,
    marginBottom: 4,
    fontWeight: "500",
  },
  paysItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  paysItemSelected: { backgroundColor: "#EEF2FF" },
  paysDrapeau: { fontSize: 24 },
  paysNom: { flex: 1, fontSize: 14, fontWeight: "500", color: "#111827" },
  paysNomSelected: { color: "#0A2FCC", fontWeight: "700" },
  paysCodeBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  paysCodeBadgeSelected: { backgroundColor: "#C7D2FE" },
  paysCode: { fontSize: 12, fontWeight: "700", color: "#374151" },
  paysCodeSelected: { color: "#0A2FCC" },
  paysCheck: {
    fontSize: 16,
    color: "#0A2FCC",
    fontWeight: "800",
    marginLeft: 4,
  },
  emptySearch: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptySearchIcon: { fontSize: 32 },
  emptySearchText: { fontSize: 13, color: "#9CA3AF", textAlign: "center" },
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
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.65)" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
  },
  cardContent: { padding: 20, paddingBottom: 50 },

  // ── Photo locale ──
  avatarWrap: { alignItems: "center", marginBottom: 4, marginTop: 8 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EEF2FF",
    borderWidth: 2.5,
    borderColor: "#0A2FCC",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarCameraIcon: { fontSize: 28 },
  avatarPlusText: {
    position: "absolute",
    bottom: -12,
    right: -8,
    fontSize: 20,
    fontWeight: "900",
    color: "#0A2FCC",
  },
  avatarHint: {
    fontSize: 11,
    color: "#374151",
    marginTop: 10,
    fontWeight: "600",
  },
  avatarFormats: { fontSize: 10, color: "#9CA3AF", marginTop: 3 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderRadius: 12,
    overflow: "hidden",
  },
  inputRowFocused: {
    borderColor: "#0A2FCC",
    backgroundColor: "#fff",
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputRowError: { borderColor: "#FF4D4D", backgroundColor: "#FEF2F2" },
  inputIcon: { fontSize: 18, paddingHorizontal: 13, paddingVertical: 13 },
  inputDivider: { width: 1, height: 42, backgroundColor: "#E5E4DF" },
  input: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  validIcon: {
    fontSize: 16,
    color: "#00C48C",
    fontWeight: "800",
    paddingRight: 13,
  },
  erreurMsg: {
    fontSize: 11,
    color: "#FF4D4D",
    fontWeight: "500",
    marginTop: 5,
    marginLeft: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderRadius: 12,
    overflow: "hidden",
  },
  phoneRowFocused: {
    borderColor: "#0A2FCC",
    backgroundColor: "#fff",
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 13,
    backgroundColor: "#EEF2FF",
    gap: 5,
  },
  flagDrapeau: { fontSize: 20 },
  flagCode: { fontSize: 12, fontWeight: "700", color: "#0A2FCC" },
  flagArrow: { fontSize: 11, color: "#0A2FCC", marginLeft: 1 },
  phoneDivider: { width: 1, height: 42, backgroundColor: "#C7D2FE" },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.5,
  },
  previewBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 7,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  previewText: { fontSize: 12, color: "#059669", fontWeight: "600" },
  genderRow: { flexDirection: "row", gap: 7 },
  genderOpt: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E4DF",
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: "center",
  },
  genderOptSel: { borderColor: "#0A2FCC", backgroundColor: "#EEF2FF" },
  genderOptText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  genderOptTextSel: { color: "#0A2FCC" },
  btnBlue: {
    backgroundColor: "#0A2FCC",
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  btnBlueDisabled: {
    backgroundColor: "#93A3D4",
    shadowOpacity: 0,
    elevation: 0,
  },
  btnBlueText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  terms: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
    marginTop: 14,
  },
  already: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  link: { color: "#0A2FCC", fontWeight: "700" },
});
