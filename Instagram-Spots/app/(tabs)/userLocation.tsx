import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function UserLocationScreen() {
  const mapRef = useRef<MapView>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const servicesOn = await Location.hasServicesEnabledAsync();
        if (!servicesOn) { setErr("Location services are off."); return; }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { setErr("Location permission denied."); return; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCoords(c);
        mapRef.current?.animateToRegion({ ...c, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 750);
      } catch (e: any) { setErr(e?.message ?? String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFillObject}
        initialRegion={{ latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation
      >
        {coords && <Marker coordinate={coords} title="You are here" />}
      </MapView>

      {loading && (
        <View style={styles.overlay}><ActivityIndicator /><Text>Locating…</Text></View>
      )}
      {err && !loading && (
        <View style={styles.overlay}><Text style={{ color: "crimson" }}>{err}</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: "absolute", top: 16, left: 16, backgroundColor: "rgba(255,255,255,0.9)", padding: 8, borderRadius: 8 }
});
