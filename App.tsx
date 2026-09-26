import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "./theme";

export default function App() {
  const handleDelete = () => {
    Alert.alert(
      "Are you sure you want to delete this?",
      "It will be gone for good.",
      [
        {
          text: "Yes",
          onPress: () => console.log("Ok, deleting"),
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>Coffee</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={handleDelete}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.white,
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: theme.color.cerulean,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "200",
  },
  button: {
    backgroundColor: theme.color.black,
    padding: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: theme.color.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
