import React from "react";
import { View, StyleSheet } from "react-native";
import MapView from "react-native-maps";

export default function MapTab() {
  return (
    <View style={{ flex:1 }}>
      <MapView style={StyleSheet.absoluteFillObject} />
    </View>
  );
}
