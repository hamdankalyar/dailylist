import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";

export default function CounterScreen() {
  const handleRequestPermission = async () => {
    try {
      const result = await registerForPushNotificationsAsync();
      console.log(result);
    } catch (error) {
      console.error("Failed to request notification permission", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Counter</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleRequestPermission}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Request permission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  button: {
    backgroundColor: theme.color.black,
    padding: 8,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: theme.color.white,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
