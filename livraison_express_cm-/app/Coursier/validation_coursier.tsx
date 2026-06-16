import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function DossierEnCours() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const rawSubmissionDate = Array.isArray(params.submissionDate)
    ? params.submissionDate[0]
    : params.submissionDate;

  // Date exacte de soumission passée en paramètre
  const submissionDate =
    rawSubmissionDate != null ? new Date(rawSubmissionDate) : new Date();

  // Deadline = soumission + 72h
  const deadline = submissionDate.getTime() + 72 * 60 * 60 * 1000;

  const [timeLeft, setTimeLeft] = useState(deadline - Date.now());
  const [blink, setBlink] = useState(true);
  // =====================================================
  // REALTIME NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    let channel: any;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel("notifications-coursier")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Notifications",
            filter: `user_id=eq.${user.id}`,
          },
          async (payload) => {
            const notif: any = payload.new;

            console.log("Nouvelle notification :", notif);

            if (notif.type === "validation_coursier") {
              router.replace("/Coursier/dashboard_coursier");
            }

            if (notif.type === "refus_coursier") {
              router.replace("/Coursier/RejetPage");
            }
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const verifierValidationCoursier = async () => {
    try {
      // utilisateur connecté
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // récupérer infos user
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) return;

      // SI ADMIN A VALIDÉ la demande
      if (data.demande_coursier === "valide" && data.role === "rider") {
        // vérifier si déjà dans riders const { data: riderExiste } = await supabase.from("riders").select("id").eq("id", user.id).single();

        // redirection dashboard coursier
        router.replace("/Coursier/dashboard_coursier");
      }

      // SI REFUSÉ PAR L'ADMIN
      if (data.demande_coursier === "refuse") {
        router.replace("/Coursier/RejetPage");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const validationInterval = setInterval(() => {
      verifierValidationCoursier();
    }, 5000);
    const interval = setInterval(() => {
      const remaining = deadline - Date.now();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        router.replace("/Coursier/RejetPage"); // redirection vers la page de rejet
      }
    }, 1000);

    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(blinkInterval);
      clearInterval(validationInterval);
    };
  }, []);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Bouton de retour */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push("./File_client/accueil-client")}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>

      {/* Icône clignotante en bouton */}
      <TouchableOpacity style={[styles.iconButton, blink && styles.blink]}>
        <Text style={styles.iconText}>⏳</Text>
      </TouchableOpacity>

      <Text style={styles.title}>DOSSIER EN COURS D’EXAMEN</Text>
      <Text style={styles.subtitle}>
        Notre équipe vérifie vos documents. Vous recevrez un SMS après
        validation.
      </Text>

      {/* Étape 1 */}
      <TouchableOpacity style={styles.section}>
        <Text style={styles.step}>✅ Documents soumis</Text>
        <Text style={styles.date}>
          {new Date(submissionDate).toLocaleString()}
        </Text>
      </TouchableOpacity>

      {/* Étape 2 */}
      <TouchableOpacity style={styles.section}>
        <Text style={styles.step}>🔍 Vérification en cours</Text>
        <Text style={styles.date}>Délai : 48–72h maximum</Text>
      </TouchableOpacity>

      {/* Étape 3 */}
      <TouchableOpacity style={styles.section}>
        <Text style={styles.step}>📩 SMS de confirmation</Text>
        <Text style={styles.date}>Notification après validation</Text>
      </TouchableOpacity>

      {/* Étape 4 : Contact */}
      <TouchableOpacity style={styles.section}>
        <Text style={styles.step}>
          📞 Une question ? contactez‑nous au +237 682429054
        </Text>
      </TouchableOpacity>

      {/* Compte à rebours */}
      <Text style={styles.countdown}>
        Temps restant : {formatTime(timeLeft)}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", backgroundColor: "#050b25" },

  backBtn: {
    backgroundColor: "#222d45",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#4d50f5",
    
  },
  backBtnText: {
    color: "#f4efef",
    fontSize: 18,
    fontWeight: "bold",
  },

  iconButton: {
    backgroundColor: "#603c0a",
    borderWidth: 2,
    borderColor: "orange",
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    opacity: 0.7, // opacité de base plus visible
  },
  iconText: { fontSize: 50, color: "orange" },
  blink: { opacity: 1 }, // quand ça clignote, pleine opacité

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#f4efef",
  },
  subtitle: {
    fontSize: 14,
    color: "#f4efef",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#3f4250",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  step: { fontWeight: "bold", fontSize: 16, color: "#f7f3f3" },
  date: { fontSize: 14, color: "#c4c2c2" },
  countdown: { marginTop: 30, fontSize: 18, fontWeight: "bold", color: "red" },
});
