import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function MesGains() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [stats, setStats] = useState<{
    total: number;
    courses: number;
    avgRating: number;
    hoursOnline: string;
    chartData: { labels: string[]; datasets: { data: number[]; colors: (() => string)[] }[] };
    nextWithdrawal: string;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 🔹 Récupérer les livraisons du coursier selon la période
      let query = supabase.from("deliveries")
        .select("id, price, created_at")
        .eq("rider_id", user.id);

      const today = new Date().toISOString().slice(0, 10);
      if (period === "day") query = query.gte("created_at", today);
      if (period === "week") query = query.gte("created_at", getMonday());
      if (period === "month") query = query.gte("created_at", getFirstDayOfMonth());

      const { data: deliveries, error } = await query;
      if (error) {
        console.error("Erreur Supabase deliveries:", error.message);
        return;
      }

      // 🔹 Calcul des gains (80% du prix)
      const total = deliveries?.reduce((sum, d) => sum + (d.price * 0.8), 0) || 0;
      const courses = deliveries?.length || 0;

      // 🔹 Récupérer la note moyenne depuis la table rating
      const { data: ratings } = await supabase
        .from("rating")
        .select("rating")
        .eq("user_id", user.id);

      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      // 🔹 Récupérer heures en ligne depuis la table riders
      const { data: rider } = await supabase
        .from("riders")
        .select("heures_en_ligne")
        .eq("id", user.id)
        .single();

      const hoursOnline = rider?.heures_en_ligne || "0h";

      setStats({
        total,
        courses,
        avgRating,
        hoursOnline,
        chartData: buildChart(period, deliveries || []),
        nextWithdrawal: getNextThursday(),
      });
    };

    fetchStats();
  }, [period]);

  if (!stats) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/Coursier/dashboard_coursier")} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>MES GAINS</Text>
        <View style={styles.tabs}>
          {["day", "week", "month"].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, period === p && styles.tabActive]}
              onPress={() => setPeriod(p as "day" | "week" | "month")}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p === "day" ? "Aujourd'hui" : p === "week" ? "Semaine" : "Mois"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Total Gagné</Text>
          <Text style={styles.summaryGain}>{stats.total} FCFA</Text>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryText}>Courses : {stats.courses}</Text>
            <Text style={styles.summaryText}>En ligne : {stats.hoursOnline}</Text>
            <Text style={styles.summaryText}>Note moy : {stats.avgRating.toFixed(1)}</Text>
          </View>
        </View>

        {/* 🔹 Diagramme */}
       <View style={styles.DiagrammeContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BarChart
          style={styles.Diagrammef}
          data={stats.chartData}
          width={screenWidth * 1.5}   // 🔹 plus large que l’écran → scroll horizontal
          height={220}
          yAxisLabel=""
          yAxisSuffix=" Fcfa"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: () => "rgb(88, 90, 92)",
            propsForBackgroundLines: { strokeWidth: 0 },
            barPercentage: 0.5,
          }}
          fromZero
          showBarTops={true}
          withCustomBarColorFromData={true}
          flatColor={true}
          showValuesOnTopOfBars={true}
        />
      </ScrollView>
    </View>

        <View style={styles.retrait}>
          <Text style={styles.retraitText}>Retrait disponible : {stats.total} FCFA</Text>
          <Text style={styles.retraitText}>Prochain retrait : {stats.nextWithdrawal}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------ Helpers ------------------ */

function getMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().slice(0, 10);
}

function getFirstDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function getNextThursday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = (4 - day + 7) % 7; // jeudi = 4
  d.setDate(d.getDate() + diff);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function buildChart(period: string, deliveries: any[]) {
  let labels: string[] = [];
  let data: number[] = [];

  if (period === "day") {
    labels = ["6h", "7h", "8h", "9h", "10h", "11h", "12h", "13h", "14h", "14h", "15h", "16h", "17h", "18h", "19h", "20h", "21h", "22h"];
    data = deliveries.map((d) => d.price * 0.8);
  } else if (period === "week") {
    labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    data = deliveries.map((d) => d.price * 0.8);
  } else {
    labels = ["S1", "S2", "S3", "S4"];
    data = deliveries.map((d) => d.price * 0.8);
  }

  const maxValue = Math.max(...data, 0);

  return {
    labels,
    datasets: [
      {
        data,
        colors: data.map((value) =>
          () => (value === maxValue ? "orange" : "rgba(66, 133, 244, 1)")
        ),
      },
    ],
  };
}
/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor:  "#fff", margin:20},
  header: {marginBottom: 20, backgroundColor: "#141428", padding: 10, borderRadius: 10 },
  backButton: { marginBottom: 10, borderRadius: 10, padding: 10, borderWidth: 1, backgroundColor: "#414242", alignSelf: "flex-start" },
  backText: { fontSize: 16, color: "#4285F4" },
  title: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 20 , color: "#fff" },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tab: { padding: 10, borderRadius: 10, backgroundColor: "#414242" },
  tabActive: { backgroundColor: "orange" },
  tabText: { color: "#fff", fontWeight: "bold" },
  tabTextActive: { color: "#000" },
  summary: { backgroundColor: "#0f0f0f", padding: 15, borderRadius: 10, borderColor: "orange", borderWidth: 1 },
  summaryTitle: { fontSize: 25, color: "#414242", marginBottom: 5 },
  summaryGain: { fontSize: 40, fontWeight: "bold", color: "orange" },
  summaryDetails: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", },
  summaryText: { fontSize: 20, marginBottom: 5, color: "#fff", padding:10  },
  Diagramme:{marginLeft:100, marginRight:20, marginVertical: 10 },
  Diagrammef:{alignItems: "center", justifyContent: "center" },
  retrait: { backgroundColor: "#eee", padding: 15, borderRadius: 10, marginTop: 20 },
  retraitText: { fontSize: 16, marginBottom: 5 },
  DiagrammeContainer: {
    marginVertical: 10,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
  },
 
});
