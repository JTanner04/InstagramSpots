import { Tabs } from "expo-router";
import ModernTabBar from "../../components/ModernTabBar";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        // Render our absolute custom bar; the default tabBar is hidden
        tabBar={(props) => <ModernTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" }, // hide default
          // Important: let screens be transparent so the photo is visible edge-to-edge
          sceneStyle: { backgroundColor: "transparent" } as any,
        }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="liked"
          options={{
            title: "Liked",
            tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="userLocation"
          options={{
            title: "Me",
            tabBarIcon: ({ color, size }) => <Ionicons name="locate" size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000", // if a screen has no image, use dark background
  },
});
