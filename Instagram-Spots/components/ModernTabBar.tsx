import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type RouteKey = "explore" | "liked" | "map" | "userLocation";

const ICONS: Record<RouteKey, keyof typeof Ionicons.glyphMap> = {
  explore: "compass",
  liked: "heart",
  map: "map",
  userLocation: "locate",
};

export default function ModernTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeIndex = state.index;

  // Measure the whole bar once
  const [barWidth, setBarWidth] = useState(0);
  const onBarLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  // animate pill using equal segments
  const x = useSharedValue(0);
  const w = useSharedValue(72);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: w.value,
  }));

  // update pill whenever index or width changes
  const PADDING_H = 8; // bar horizontal padding
  const GAP = 0;       // if you add gaps between items, account here
  const count = state.routes.length;
  const inner = Math.max(barWidth - PADDING_H * 2, 0);
  const seg = count > 0 ? inner / count : 0;

  // compute target x/width
  if (seg > 0) {
    const targetX = PADDING_H + activeIndex * seg;
    x.value = withSpring(targetX, { damping: 18, stiffness: 160 });
    w.value = withSpring(Math.max(seg - GAP, 64), { damping: 18, stiffness: 160 });
  }

  return (
    <View pointerEvents="box-none" style={styles.absWrap}>
      <View style={styles.bar} onLayout={onBarLayout}>
        {/* animated pill under the active tab */}
        <Animated.View style={[styles.pill, animatedStyle]} />

        {state.routes.map((route, i) => {
          const isFocused = activeIndex === i;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title as string) || route.name;

          const key = (route.name as string).replace(/^\(tabs\)\//, "") as RouteKey;
          const icon = ICONS[key] ?? "ellipse";

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Ionicons
                name={icon}
                size={20}
                color={isFocused ? "#00E08A" : "rgba(255,255,255,0.75)"}
                style={{ marginBottom: 2 }}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label === "userLocation" ? "Me" : label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,            // overlay above gesture area
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    borderRadius: 22,
    paddingHorizontal: 8, // keep in sync with PADDING_H above
    backgroundColor: "rgba(24,24,26,0.92)",
    width: "92%",
    overflow: "hidden",
  },
  pill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  labelActive: { color: "#F4FFF9", fontWeight: "700" },
});
