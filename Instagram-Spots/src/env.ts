// src/env.ts
import Constants from "expo-constants";

const extra =
  (Constants.expoConfig?.extra as any) ||
  ((Constants.manifest as any)?.extra ?? {});

export const MAPBOX_TOKEN: string =
  extra?.EXPO_PUBLIC_MAPBOX_TOKEN || process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "";

export const UNSPLASH_KEY: string =
  extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ||
  process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ||
  "";

// Loud startup logs so we know keys are actually loaded
console.log("🗺️ MAPBOX token:", MAPBOX_TOKEN ? "Loaded ✅" : "❌ MISSING");
console.log("📸 UNSPLASH key:", UNSPLASH_KEY ? "Loaded ✅" : "❌ MISSING");
