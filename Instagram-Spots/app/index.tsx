// app/index.tsx
import React from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Text style={styles.hero}>Find Instagram-worthy spots ✨</Text>
          <Text style={styles.sub}>
            Pick a vibe and how far you’re willing to go. Swipe to save favorites.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/explore-quiz")}
          style={({ pressed }) => [
            styles.cta,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.ctaText}>Start</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F8" },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 32,
    paddingTop: 24,
  },
  hero: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0B0B0F",
    letterSpacing: 0.2,
  },
  sub: {
    textAlign: "center",
    color: "#5B5B66",
    fontSize: 16,
    lineHeight: 22,
  },
  cta: {
    alignSelf: "center",
    backgroundColor: "#0B0B0F",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    minWidth: 160,
  },
  ctaText: { color: "white", fontWeight: "700", fontSize: 17, textAlign: "center" },
});
