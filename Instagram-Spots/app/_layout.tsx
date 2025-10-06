import { Stack } from "expo-router";
import { useEffect } from "react";
import { DevSettings, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  useEffect(() => {
    // Disable the Router Inspector overlay permanently in development
    if (__DEV__) {
      try {
        // Some Expo versions expose this toggle
        // @ts-ignore
        DevSettings.setIsInspectorEnabled?.(false);

        // On some setups, the router inspector can be disabled via console
        if ((globalThis as any).__DEV__ && Platform.OS !== "web") {
          // @ts-ignore
          globalThis.__router_inspector__ = false;
        }
        console.log("🧩 Expo Router Inspector disabled permanently ✅");
      } catch (err) {
        console.log("⚠️ Could not disable Router Inspector:", err);
      }
    }
  }, []);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </SafeAreaProvider>
  );
}
