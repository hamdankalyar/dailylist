import * as Device from "expo-device";
// Keep local notifications usable in Android Expo Go without remote push registration.
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";

export default function CounterScreen() {
  const handleScheduleNotification = async () => {
    try {
      const result = await registerForPushNotificationsAsync();
      if (result === "granted") {
        await scheduleNotificationAsync({
          content: { title: "I'm a notification from your app" },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 5,
            channelId: "default",
          },
        });
      } else if (Device.isDevice) {
        Alert.alert(
          "Unable to schedule notification",
          "Enable the notification permission for Expo Go in settings.",
        );
      }
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Counter</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleScheduleNotification}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Schedule notification</Text>
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
