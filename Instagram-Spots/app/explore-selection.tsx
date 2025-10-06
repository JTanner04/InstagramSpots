import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const VIBES = ["instagrammable", "nature", "city", "foodie", "art", "nightlife"] as const;
type Vibe = (typeof VIBES)[number];

export default function ExploreSelection() {
  const router = useRouter();

  const [vibe, setVibe] = useState<Vibe>("instagrammable");
  const [mode, setMode] = useState<"drive" | "fly">("drive");
  const [outOfState, setOutOfState] = useState(false);
  const [driveMinutes, setDriveMinutes] = useState(90); // 15–300
  const [flyHours, setFlyHours] = useState(2);          // 1–6

  const timeLabel = useMemo(
    () => (mode === "drive" ? `${driveMinutes} min` : `${flyHours} hr`),
    [mode, driveMinutes, flyHours]
  );

  const onStart = () => {
    router.replace({
      pathname: "/(tabs)/explore",
      params: {
        vibe,
        mode,
        outOfState: String(outOfState),
        drive: String(driveMinutes),
        fly: String(flyHours),
      },
    });
  };

  return (
    <SafeAreaView style={styles.wrap} edges={["top"]}>
      <Text style={styles.header}>Pick your vibe</Text>

      <View style={styles.chips}>
        {VIBES.map((v) => {
          const active = v === vibe;
          return (
            <TouchableOpacity
              key={v}
              onPress={() => setVibe(v)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{v}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Travel mode</Text>
      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentBtn, mode === "drive" && styles.segmentBtnActive]}
          onPress={() => setMode("drive")}
        >
          <Ionicons name="car" size={16} color={mode === "drive" ? "#fff" : "#111"} />
          <Text style={[styles.segmentText, mode === "drive" && styles.segmentTextActive]}>
            Drive
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, mode === "fly" && styles.segmentBtnActive]}
          onPress={() => setMode("fly")}
        >
          <Ionicons name="airplane" size={16} color={mode === "fly" ? "#fff" : "#111"} />
          <Text style={[styles.segmentText, mode === "fly" && styles.segmentTextActive]}>
            Fly
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rowCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles.dot, outOfState ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.rowTitle}>Allow out-of-state</Text>
        </View>
        <Switch value={outOfState} onValueChange={setOutOfState} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sliderTitle}>
          {mode === "drive" ? "Max drive time" : "Max flight time"}:{" "}
          <Text style={styles.sliderValue}>{timeLabel}</Text>
        </Text>

        {mode === "drive" ? (
          <Slider
            minimumValue={15}
            maximumValue={300}
            step={5}
            value={driveMinutes}
            onValueChange={(v) => setDriveMinutes(Math.round(v))}
            minimumTrackTintColor="#111"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#111"
          />
        ) : (
          <Slider
            minimumValue={1}
            maximumValue={6}
            step={1}
            value={flyHours}
            onValueChange={(v) => setFlyHours(Math.round(v))}
            minimumTrackTintColor="#111"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#111"
          />
        )}

        <View style={styles.sliderEnds}>
          <Text style={styles.sliderEndText}>{mode === "drive" ? "15m" : "1h"}</Text>
          <Text style={styles.sliderEndText}>{mode === "drive" ? "5h" : "6h"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.cta} onPress={onStart} activeOpacity={0.9}>
        <Text style={styles.ctaText}>See spots</Text>
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#f6f7f9", paddingTop: 12, paddingHorizontal: 22 },
  header: { fontSize: 34, fontWeight: "900", color: "#111", marginBottom: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#e9eaef",
  },
  chipActive: { backgroundColor: "#111" },
  chipText: { color: "#111", fontWeight: "700" },
  chipTextActive: { color: "#fff" },

  sectionTitle: { marginTop: 6, marginBottom: 10, color: "#111", fontWeight: "800", fontSize: 22 },
  segment: {
    flexDirection: "row",
    backgroundColor: "#e9eaef",
    borderRadius: 16,
    padding: 6,
    gap: 6,
    alignSelf: "flex-start",
  },
  segmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  segmentBtnActive: { backgroundColor: "#111" },
  segmentText: { color: "#111", fontWeight: "700" },
  segmentTextActive: { color: "#fff" },

  rowCard: {
    marginTop: 14,
    backgroundColor: "#eef0f5",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dot: { width: 18, height: 18, borderRadius: 9 },
  dotOn: { backgroundColor: "#111" },
  dotOff: { backgroundColor: "#b6bcc7" },
  rowTitle: { color: "#111", fontWeight: "800", fontSize: 18 },

  card: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  sliderTitle: { color: "#111", fontWeight: "800", fontSize: 18, marginBottom: 12 },
  sliderValue: { color: "#555", fontWeight: "800" },
  sliderEnds: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  sliderEndText: { color: "#9aa0aa", fontWeight: "700" },

  cta: {
    marginTop: 24,
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
