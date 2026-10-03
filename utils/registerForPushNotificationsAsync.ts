import * as Device from "expo-device";
// SDK 57's main entry loads remote push registration, which throws in Android Expo Go.
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice || Platform.OS === "web") return null;

  if (Platform.OS === "android") {
    await setNotificationChannelAsync("default", {
      name: "Default",
      importance: AndroidImportance.DEFAULT,
    });
  }

  const { status } = await getPermissionsAsync();
  if (status !== "undetermined") return status;

  const permission = await requestPermissionsAsync();
  return permission.status;
}
