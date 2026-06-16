import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function VerificationOTPScreen() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [tempsRestant, setTempsRestant] = useState(300);
  const [expire, setExpire] = useState(false);
  const [erreurCode, setErreurCode] = useState("");
  const [chargement, setChargement] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const params = useLocalSearchParams();
  const telephone =
    typeof params.telephone === "string" ? params.telephone : "";
  const country = typeof params.country === "string" ? params.country : "";
  const genre = typeof params.genre === "string" ? params.genre : "";

  const email = typeof params.email === "string" ? params.email : "";
  const nom = typeof params.nom === "string" ? params.nom : "";
  const source =
    typeof params.source === "string" ? params.source : "inscription";

  // ── Compte à rebours ──
  useEffect(() => {
    if (tempsRestant <= 0) {
      setExpire(true);
      return;
    }
    const timer = setTimeout(() => setTempsRestant((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [tempsRestant]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (!text && index > 0) inputs.current[index - 1]?.focus();
  };

  // ── Valider le code OTP ──
  const handleVerifier = async () => {
    const codeComplet = code.join("");
    if (codeComplet.length !== 6) {
      setErreurCode("Veuillez entrer les 6 chiffres.");
      return;
    }
    setErreurCode("");
    setChargement(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codeComplet,
        type: "email",
      });

      if (error) {
        setErreurCode("Code incorrect ou expiré. Vérifiez votre email.");
        console.log("Erreur OTP:", error.message);
        return;
      }

      const user = data?.user;
      if (!user) {
        setErreurCode("Utilisateur introuvable. Réessayez.");
        return;
      }

      console.log("✅ Connecté:", user.id);

      // Si inscription → enregistrer le nom
      if (source === "inscription" && nom) {
        const { error: insertError } = await supabase.from("users").upsert(
          [
            {
              id: user.id,
              full_name: nom,
              email: user.email,
              phone: telephone,
              country: country,
              genre: genre || null,
              role: "client",
            },
          ],
          { onConflict: "id" },
        );
        if (insertError) console.log("Erreur insertion:", insertError.message);
        else console.log("✅ Utilisateur enregistré");
      }

      // ✅ Redirection vers l'accueil dans TOUS les cas
      //router.replace("/File_client/accueil-client");
      //} catch (err) {
      //console.log("Erreur vérification:", err);

      // ── Vérification du statut ──
      const { data: users, error: profilError } = await supabase
        .from("users")
        .select("role, demande_coursier")
        .eq("id", user.id)
        .single();

      if (profilError) {
        console.log("Erreur récupération profil:", profilError.message);
        router.replace("./File_client/accueil-client");
        return;
      }

      if (users.role === "client") {
        if (!users.demande_coursier) {
          // Pas encore soumis de dossier
          router.replace("./File_client/accueil-client");
        } else if (users.demande_coursier === "en_attente") {
          // Dossier soumis mais en attente
          router.replace("/Coursier/validation_coursier");
        } else {
          // Par défaut → accueil client
          router.replace("./File_client/accueil-client");
        }
      } else if (users.role === "rider") {
        router.replace("/Coursier/dashboard_coursier");
      } else {
        // Fallback
        router.replace("./File_client/accueil-client");
      }
    } catch (err) {
      console.log("Erreur vérification:", err);
      setErreurCode("Une erreur est survenue. Réessayez.");
    } finally {
      setChargement(false);
    }
  };

  // ── Renvoyer un nouveau code ──
  const handleRenvoyer = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: source === "inscription" },
    });
    if (error) {
      Alert.alert("Erreur", "Impossible de renvoyer le code.");
    } else {
      setCode(["", "", "", "", "", ""]);
      setTempsRestant(180);
      setExpire(false);
      setErreurCode("");
    }
  };

  // ══════════════════════════════════════════
  //  ÉCRAN EXPIRÉ
  // ══════════════════════════════════════════
  if (expire) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#080C1A" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 26 }}>⏱️</Text>
          </View>
          <Text style={styles.headerTitle}>Code expiré</Text>
          <Text style={styles.headerSub}>Votre session a expiré</Text>
        </View>

        <View style={styles.expireCard}>
          <Text style={styles.expireEmoji}>😕</Text>
          <Text style={styles.expireTitle}>Désolé, votre temps a expiré</Text>
          <Text style={styles.expireSubtitle}>
            Le code envoyé à{"\n"}
            <Text style={{ color: "#0A2FCC", fontWeight: "700" }}>{email}</Text>
            {"\n"}n'est plus valide.
          </Text>

          <TouchableOpacity
            style={styles.btnRetour}
            onPress={() =>
              source === "connexion"
                ? router.replace("./File_client/connexion")
                : router.replace("./File_client/inscription")
            }
            activeOpacity={0.8}
          >
            <Text style={styles.btnRetourText}>
              {source === "connexion"
                ? "↩ Retour à la connexion"
                : "↩ Veuillez vous inscrire à nouveau"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGhost}
            onPress={handleRenvoyer}
            activeOpacity={0.8}
          >
            <Text style={styles.btnGhostText}>🔄 Renvoyer un nouveau code</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════
  //  ÉCRAN NORMAL
  // ══════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080C1A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 26 }}>💬</Text>
        </View>
        <Text style={styles.headerTitle}>Code de vérification</Text>
        <Text style={styles.headerSub}>
          Code OTP envoyé à <Text style={{ color: "#FFB800" }}>{email}</Text>
        </Text>
      </View>

      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.otpLabel}>
          Entre les 6 chiffres reçus par email
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text.slice(-1), index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {erreurCode.length > 0 && (
          <Text style={styles.erreurCode}>⚠️ {erreurCode}</Text>
        )}

        <View
          style={[styles.timerBox, tempsRestant <= 10 && styles.timerBoxUrgent]}
        >
          <Text
            style={[
              styles.timerText,
              tempsRestant <= 10 && styles.timerTextUrgent,
            ]}
          >
            ⏱ Temps restant :{" "}
            <Text
              style={[
                styles.timerBold,
                tempsRestant <= 10 && styles.timerBoldUrgent,
              ]}
            >
              {tempsRestant}s
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.btnBlue,
            (code.join("").length !== 6 || chargement) &&
              styles.btnBlueDisabled,
          ]}
          onPress={handleVerifier}
          disabled={code.join("").length !== 6 || chargement}
          activeOpacity={0.8}
        >
          <Text style={styles.btnBlueText}>
            {chargement ? "Vérification en cours..." : "✓ Valider le code"}
          </Text>
        </TouchableOpacity>

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            📌 Tu ne reçois pas l'OTP ? Vérifie tes spams ou contacte le support
            : <Text style={styles.helpBold}>+237 6XX XX XX XX</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#080C1A",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  backBtn: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  backBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerIcon: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
  },
  cardContent: { padding: 20, alignItems: "center", paddingBottom: 40 },
  otpLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  otpBox: {
    width: 44,
    height: 54,
    borderWidth: 2,
    borderColor: "#E5E4DF",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  otpBoxFilled: {
    borderColor: "#0A2FCC",
    backgroundColor: "#EEF2FF",
    color: "#0A2FCC",
  },
  erreurCode: {
    fontSize: 12,
    color: "#FF4D4D",
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  timerBox: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  timerBoxUrgent: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  timerText: { fontSize: 13, color: "#0A2FCC", textAlign: "center" },
  timerTextUrgent: { color: "#FF4D4D" },
  timerBold: { fontWeight: "800", color: "#0A2FCC" },
  timerBoldUrgent: { color: "#FF4D4D" },
  btnBlue: {
    backgroundColor: "#0A2FCC",
    borderRadius: 13,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
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
  helpBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 11,
    padding: 12,
    marginTop: 16,
    width: "100%",
  },
  helpText: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  helpBold: { color: "#0A2FCC", fontWeight: "700" },
  expireCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  expireEmoji: { fontSize: 56, marginBottom: 16 },
  expireTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  expireSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  btnRetour: {
    backgroundColor: "#0A2FCC",
    borderRadius: 13,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#0A2FCC",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  btnRetourText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  btnGhost: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: "#E5E4DF",
    borderRadius: 13,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
  },
  btnGhostText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
});
