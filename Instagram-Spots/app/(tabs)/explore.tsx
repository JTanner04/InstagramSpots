// app/(tabs)/explore.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchNearbyPlaces, Place } from "../../src/api/places";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_W = width - 48;
const CARD_H = Math.round((CARD_W * 4) / 3); // 3:4 aspect

type Mode = "drive" | "fly";

export default function Explore() {
  const insets = useSafeAreaInsets();

  // filters (you can wire these to your selection screen)
  const [vibe] = useState("instagrammable");
  const [mode, setMode] = useState<Mode>("drive");
  const [driveMinutes] = useState(90);
  const [flyHours] = useState(2);
  const [outOfState, setOutOfState] = useState(false);

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [cards, setCards] = useState<Place[]>([]);
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState<Place[]>([]);
  const [passed, setPassed] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // swipe
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setOrigin({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  async function loadPlaces() {
    if (!origin) return;
    setLoading(true);
    try {
      const results = await fetchNearbyPlaces(
        origin,
        vibe,
        mode,
        driveMinutes,
        flyHours,
        !outOfState ? false : true, // keep flag
        50
      );
      setCards(results);
      setIdx(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (origin) loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, mode, outOfState]);

  const current = cards[idx];

  function onPass() {
    if (!current) return;
    setPassed((p) => [...p, current]);
    setIdx((n) => Math.min(n + 1, cards.length));
    pan.setValue({ x: 0, y: 0 });
  }
  function onSave() {
    if (!current) return;
    setSaved((s) => [...s, current]);
    setIdx((n) => Math.min(n + 1, cards.length));
    pan.setValue({ x: 0, y: 0 });
  }

  function goBack() {
    if (idx === 0) return;
    setIdx((n) => Math.max(0, n - 1));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Top filter chips */}
      <View style={styles.topRow}>
        <Pressable style={styles.chip} onPress={loadPlaces}>
          <Ionicons name="filter" size={18} color="#fff" />
          <Text style={styles.chipText}>Change filters</Text>
        </Pressable>

        <Pressable
          style={[styles.chip, { backgroundColor: outOfState ? "#2a2a2a" : "#3b3b3b" }]}
          onPress={() => setOutOfState((v) => !v)}
        >
          <Ionicons name={outOfState ? "airplane" : "car"} size={18} color="#fff" />
          <Text style={styles.chipText}>{outOfState ? "Out-of-State" : "In-State Only"}</Text>
        </Pressable>
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        {loading && (
          <View style={[styles.card, styles.cardPlaceholder]}>
            <ActivityIndicator />
          </View>
        )}

        {!loading && current && (
          <Animated.View style={[styles.card, { transform: [{ rotate }] }]}>
            <ImageBackground
              source={current.photo ? { uri: current.photo } : undefined}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
              imageStyle={{ borderRadius: 28 }}
            >
              {!current.photo && <View style={styles.cardPlaceholder} />}

              {/* center title block */}
              <View style={styles.centerCaption}>
                <View style={styles.captionPill}>
                  <Text numberOfLines={1} style={styles.placeTitle}>
                    {current.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.placeSub}>
                    {[current.city, current.state].filter(Boolean).join(", ")}
                    {typeof current.distanceKm === "number"
                      ? ` • ${Math.round(current.distanceKm)} km`
                      : ""}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </Animated.View>
        )}

        {!loading && !current && (
          <View style={[styles.emptyState]}>
            <Text style={styles.emptyText}>No spots found nearby.</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={goBack} style={[styles.actionBtn, { backgroundColor: "#6b6b6b" }]}>
          <Ionicons name="arrow-undo" size={28} color="#fff" />
        </Pressable>
        <Pressable onPress={onPass} style={[styles.actionBtn, { backgroundColor: "#ffd6d6" }]}>
          <Ionicons name="close" size={36} color="#d33" />
        </Pressable>
        <Pressable onPress={onSave} style={[styles.actionBtn, { backgroundColor: "#d8f7df" }]}>
          <Ionicons name="heart" size={32} color="#0a9f4d" />
        </Pressable>
      </View>

      {/* Counters */}
      <Text style={styles.counter}>
        Saved: {saved.length} • Passed: {passed.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topRow: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3b3b3b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  chipText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  cardWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    height: CARD_H,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  cardPlaceholder: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  centerCaption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  captionPill: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    maxWidth: CARD_W - 32,
    alignItems: "center",
  },
  placeTitle: { color: "#fff", fontSize: 28, fontWeight: "800" },
  placeSub: { color: "#eee", fontSize: 16, marginTop: 2 },

  emptyState: { height: CARD_H, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#fff", fontSize: 18 },

  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  actionBtn: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  counter: {
    textAlign: "center",
    marginTop: 10,
    color: "#ddd",
  },
});
