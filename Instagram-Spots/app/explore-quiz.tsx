// app/explore-quiz.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { usePrefs, type Vibe } from "../src/prefs";

const vibes: Vibe[] = [
  "instagrammable",
  "nature",
  "city",
  "foodie",
  "art",
  "nightlife",
];

export default function ExploreQuiz() {
  const router = useRouter();
  const { setPrefs } = usePrefs();

  const [vibe, setVibe] = useState<Vibe>("instagrammable");
  const [travelMode, setTravelMode] = useState<"drive" | "fly">("drive");
  const [outOfState, setOutOfState] = useState(false);
  const [driveMinutes, setDriveMinutes] = useState(90);
  const [flyHours, setFlyHours] = useState(2);

  const done = () => {
    setPrefs({ vibe, travelMode, outOfState, driveMinutes, flyHours });
    router.replace("/explore");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 28 }}
      >
        <Text style={styles.h1}>Pick your vibe</Text>

        {/* Vibes */}
        <View style={styles.pillWrap}>
          {vibes.map((v) => {
            const active = v === vibe;
            return (
              <Pressable
                key={v}
                onPress={() => setVibe(v)}
                style={[
                  styles.pill,
                  active ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {v}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Travel mode */}
        <Text style={styles.h2}>Travel mode</Text>
        <View style={styles.segment}>
          {(["drive", "fly"] as const).map((m) => {
            const active = m === travelMode;
            return (
              <Pressable
                key={m}
                onPress={() => setTravelMode(m)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {m === "drive" ? "Drive" : "Fly"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Out-of-state toggle (switch-like) */}
        <Pressable
          onPress={() => setOutOfState((v) => !v)}
          style={[styles.toggle, outOfState && styles.toggleOn]}
        >
          <View style={[styles.toggleKnob, outOfState && styles.toggleKnobOn]} />
          <Text style={styles.toggleLabel}>Allow out-of-state</Text>
        </Pressable>

        {/* Range sliders */}
        {travelMode === "drive" ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Max drive time: {driveMinutes} min</Text>
            <Slider
              value={driveMinutes}
              onValueChange={setDriveMinutes}
              step={5}
              minimumValue={15}
              maximumValue={300}
              minimumTrackTintColor="#0B0B0F"
              maximumTrackTintColor="#D1D1D6"
              thumbTintColor="#0B0B0F"
              style={{ width: "100%", height: 38 }}
            />
            <View style={styles.rangeRow}>
              <Text style={styles.rangeText}>15m</Text>
              <Text style={styles.rangeText}>5h</Text>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              Max flight time: {flyHours.toFixed(1)} hours
            </Text>
            <Slider
              value={flyHours}
              onValueChange={setFlyHours}
              step={0.5}
              minimumValue={0.5}
              maximumValue={6}
              minimumTrackTintColor="#0B0B0F"
              maximumTrackTintColor="#D1D1D6"
              thumbTintColor="#0B0B0F"
              style={{ width: "100%", height: 38 }}
            />
            <View style={styles.rangeRow}>
              <Text style={styles.rangeText}>0.5h</Text>
              <Text style={styles.rangeText}>6h</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating CTA */}
      <Pressable
        onPress={done}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.ctaText}>See spots</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F8" },
  scroll: { flex: 1 },
  h1: { fontSize: 28, fontWeight: "800", color: "#0B0B0F", letterSpacing: 0.2 },
  h2: { fontSize: 18, fontWeight: "700", color: "#0B0B0F" },

  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  pillInactive: { backgroundColor: "#EAEAEE" },
  pillActive: { backgroundColor: "#0B0B0F" },
  pillText: { color: "#0B0B0F", fontWeight: "600" },
  pillTextActive: { color: "#fff" },

  segment: {
    flexDirection: "row",
    backgroundColor: "#EAEAEE",
    padding: 4,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  segmentItemActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: { color: "#5B5B66", fontWeight: "700" },
  segmentTextActive: { color: "#0B0B0F" },

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EEEFF3",
    padding: 12,
    borderRadius: 12,
  },
  toggleOn: { backgroundColor: "#DDE7FF" },
  toggleKnob: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#C7C7CC",
  },
  toggleKnobOn: { backgroundColor: "#0B5FFF" },
  toggleLabel: { fontWeight: "600", color: "#0B0B0F" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 8,
  },
  cardLabel: { fontWeight: "700", color: "#0B0B0F" },

  rangeRow: { flexDirection: "row", justifyContent: "space-between" },
  rangeText: { color: "#8E8E93", fontSize: 12 },

  cta: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    backgroundColor: "#0B0B0F",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
