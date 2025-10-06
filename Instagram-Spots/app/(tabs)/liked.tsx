import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLikes } from "../../src/store/likes";

export default function LikedScreen() {
  const { likes, removeLike, clearLikes } = useLikes();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked</Text>
        {likes.length > 0 && (
          <Pressable onPress={clearLikes} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {likes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No liked places yet.</Text>
          <Text style={styles.sub}>Swipe right on Explore to save a spot.</Text>
        </View>
      ) : (
        <FlatList
          data={likes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText} numberOfLines={1}>
                {item.title}
              </Text>
              <Pressable onPress={() => removeLike(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 24, fontWeight: "800" },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#1E2127",
  },
  clearText: { color: "#bbb", fontSize: 12 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  empty: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  sub: { color: "#aaa", fontSize: 13, textAlign: "center" },

  row: {
    backgroundColor: "#14161A",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { color: "#fff", fontSize: 16, fontWeight: "600", flex: 1, marginRight: 12 },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "#272B33" },
  removeText: { color: "#ff9aa2", fontSize: 12, fontWeight: "700" },
});
