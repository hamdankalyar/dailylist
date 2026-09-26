import { StatusBar } from "expo-status-bar";
import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { theme } from "../theme";

export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "pink" }]} />
      <Link
        href="/counter"
        style={{ textAlign: "center", marginBottom: 18, fontSize: 24 }}
      >
        Go to counter
      </Link>
      <TouchableOpacity
        onPress={() => router.navigate("/idea")}
        accessibilityRole="button"
      >
        <Text style={{ textAlign: "center", marginBottom: 18, fontSize: 24 }}>
          Go to idea
        </Text>
      </TouchableOpacity>
      <ShoppingListItem name="Coffee" />
      <ShoppingListItem name="Tea" isCompleted />
      <ShoppingListItem name="Sugar" />
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
});
