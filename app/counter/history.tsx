import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { theme } from "../../theme";
import {
  loadCountdownState,
  type PersistedCountdownState,
} from "../../utils/countdown";

export default function HistoryScreen() {
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();

  useEffect(() => {
    let active = true;
    const init = async () => {
      const value = await loadCountdownState();
      if (active) setCountdownState(value);
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  if (!countdownState) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator accessibilityLabel="Loading history" />
      </View>
    );
  }

  return (
    <FlatList
      data={countdownState.completedAtTimestamps}
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={(timestamp, index) => `${timestamp}-${index}`}
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>{format(item, "PPpp")}</Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>No history</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: theme.color.white },
  contentContainer: { paddingTop: 8 },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.color.white,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    backgroundColor: theme.color.lightGray,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  listItemText: { fontSize: 18, color: theme.color.black },
  listEmptyContainer: {
    alignItems: "center",
    marginVertical: 18,
  },
});
