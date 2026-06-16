import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams, router } from "expo-router";

export default function ConfirmationLivraison() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [delivery, setDelivery] = useState<any>(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const { data, error } = await supabase.from("deliveries").select("*").eq("id", id).single();
        if (error) {
          console.warn("Erreur Supabase, utilisation des données fictives:", error.message);
          return useFakeData();
        }
        setDelivery(data);
      } catch (err) {
        console.error("Erreur inattendue:", err);
        useFakeData();
      }
    };

    const useFakeData = () => {
      const fakeDelivery = {
        id: "1",
        price: 5000,
        commission: 1000,
        gain: 4000,
        duration: 35,
        distance: 7,
        rating: 4.5,
      };
      setDelivery(fakeDelivery);
    };

    fetchDelivery();
  }, [id]);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ base64: false });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from("deliveries")
        .upload(`proof/${id}.jpg`, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.error("Erreur upload:", error.message);
        Alert.alert("❌ Erreur", "L'upload de la photo a échoué.");
      } else {
        setPhotoUploaded(true);
        Alert.alert("Succès", "Photo envoyée avec succès !");
      }
    }
  };

  if (!delivery) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>✅ </Text>
        <Text style={styles.headerText}>Livraison réussie !</Text>
        <Text style={styles.headergain}>+{delivery.gain} FCFA </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.statsBox}>
          <View style={styles.statsBox1}> 
            <Text style={styles.statsItem}>{delivery.duration} MIN</Text>
            <Text style={styles.statsdet}>Durée</Text> 
          
          </View>
          <View style={styles.statsBox1}> 
            <Text style={styles.statsItem}>{delivery.distance} KM</Text>
            <Text style={styles.statsdet}>Distance</Text> 
          
          </View>

          <View style={styles.statsBox1}> 
            <Text style={styles.statsItem}> {delivery.rating}★</Text>
            <Text style={styles.statsdet}>Ta note</Text> 
          
          </View>
          
          
        </View>

        {/* Affichage conditionnel : bouton ou photo */}
        {!photoUploaded ? (
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.photoText}>📸 Prendre une photo</Text>
          </TouchableOpacity>
        ) : (
          photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={styles.previewImage}
            />
          )
        )}

        <View style={styles.gainsBox}>
          <View style={styles.gainrow}> 
            <Text style={styles.gainText1}> Prix course  </Text>
            <Text style={styles.gainText2}>{delivery.price} FCFA</Text> 
          
          </View>
          <View style={styles.gainrow}> 
            <Text style={styles.gainText1}> Commission LEC (20%) </Text>
            <Text style={styles.gainText2}>-{delivery.commission} FCFA</Text> 
          
          </View>
          <View style={styles.gainrow}> 
            <Text style={styles.gainText2}> Ton gain </Text>
            <Text style={styles.gainText3}> {delivery.gain} FCFA</Text> 
          
          </View>
          
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/Coursier/Mes_gains")}>
        <Text style={styles.buttonText}>VOIR MES GAINS</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------ Styles ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff", margin: 20 },
  scrollContainer: {flex: 1, borderRadius: 20, backgroundColor: "#e6e3e3",},
  header: {
    backgroundColor: "#04240d",
    padding: 20,
    alignItems: "center",
    
   
  },
  headerText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  headergain: { color: "orange", fontSize: 30, fontWeight: "bold" },
  statsBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    
    padding: 20,
  },
  statsBox1: {
    backgroundColor: "#d3d3d3",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    width: "30%",
    
  },
  statsItem: {
    fontSize: 18,
    fontWeight: "bold",
  },

  statsdet: {
    fontSize: 14,
    color: "#555",
    
  },

  photoButton: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#aaa",
    
  },
  photoText: { fontSize: 16, fontWeight: "bold" },

  previewImage: {
    margin: 15,
    width: "90%",
    height: 200,
    alignSelf: "center",
    borderRadius: 10,
  },

  gainsBox: {
    backgroundColor: "#d3d3d3",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  gainrow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gainText1: { fontSize: 20, marginBottom: 5, color: "#333" },
  gainText2: { fontSize: 25, marginBottom: 5, fontWeight: "bold", color: "#141414" },
  gainText3: { fontSize: 30, marginBottom: 5, fontWeight: "bold", color: "green" },

  button: {
    backgroundColor: "#4285F4",
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
