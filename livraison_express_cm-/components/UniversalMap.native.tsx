import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";

const { height } = Dimensions.get("window");

interface UniversalMapProps {
  pickup_address: { latitude: number; longitude: number };
  delivery_address: { latitude: number; longitude: number };
}

const UniversalMap: React.FC<UniversalMapProps> = ({ pickup_address, delivery_address }) => {
  const [Leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    // Charger Leaflet uniquement côté client
    if (typeof window !== "undefined") {
      import("react-leaflet").then((mod) => {
        setLeaflet(mod);
        import("leaflet/dist/leaflet.css");
      });
    }
  }, []);

  if (!Leaflet) {
    return <div style={{ width: "100%", height: height * 0.28 }}>Chargement de la carte...</div>;
  }

  const { MapContainer, TileLayer, Marker, Polyline } = Leaflet;

  const midLat = (pickup_address.latitude + delivery_address.latitude) / 2;
  const midLng = (pickup_address.longitude + delivery_address.longitude) / 2;

  return (
    <MapContainer
      center={[midLat, midLng]}
      zoom={13}
      style={{ width: "100%", height: height * 0.28 }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[pickup_address.latitude, pickup_address.longitude]} />
      <Marker position={[delivery_address.latitude, delivery_address.longitude]} />
      <Polyline
        positions={[
          [pickup_address.latitude, pickup_address.longitude],
          [delivery_address.latitude, delivery_address.longitude],
        ]}
        pathOptions={{ color: "#4285F4", weight: 3 }}
      />
    </MapContainer>
  );
};

export default UniversalMap;