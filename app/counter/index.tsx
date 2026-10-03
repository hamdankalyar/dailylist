import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
// Keep local notifications usable in Android Expo Go without remote push registration.
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { TimerSegment } from "../../components/TimerSegment";
import { theme } from "../../theme";
import {
  countdownStorageKey,
  frequency,
  getCountdownStatus,
  loadCountdownState,
  type CountdownStatus,
  type PersistedCountdownState,
} from "../../utils/countdown";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import { saveToStorage } from "../../utils/storage";

export default function CounterScreen() {
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>();
  const [isCompleting, setIsCompleting] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  const { width } = useWindowDimensions();
  const isLoading = countdownState === undefined;
  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

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

  useEffect(() => {
    if (isLoading) return;
    const timestamp =
      lastCompletedTimestamp === undefined
        ? Date.now()
        : lastCompletedTimestamp + frequency;
    const updateStatus = () => setStatus(getCountdownStatus(timestamp));
    updateStatus();
    const intervalId = setInterval(updateStatus, 1000);
    return () => clearInterval(intervalId);
  }, [isLoading, lastCompletedTimestamp]);

  const handleComplete = async () => {
    if (!countdownState || isCompleting) return;
    setIsCompleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      console.error,
    );
    confettiRef.current?.start();
    let currentNotificationId = countdownState.currentNotificationId;
    try {
      if (currentNotificationId) {
        await cancelScheduledNotificationAsync(currentNotificationId);
        currentNotificationId = undefined;
      }
      const result = await registerForPushNotificationsAsync();
      if (result === "granted") {
        currentNotificationId = await scheduleNotificationAsync({
          content: { title: "Time to wash the car" },
          trigger: {
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: frequency / 1000,
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
    const newCountdownState: PersistedCountdownState = {
      currentNotificationId,
      completedAtTimestamps: [
        Date.now(),
        ...countdownState.completedAtTimestamps,
      ],
    };
    setCountdownState(newCountdownState);
    await saveToStorage(countdownStorageKey, newCountdownState);
    setIsCompleting(false);
  };

  if (!countdownState || !status) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator accessibilityLabel="Loading countdown" />
      </View>
    );
  }
  const textStyle = status.isOverdue ? styles.whiteText : undefined;

  return (
    <View
      style={[
        styles.container,
        status.isOverdue ? styles.containerLate : undefined,
      ]}
    >
      <Text style={[styles.heading, textStyle]}>
        {status.isOverdue ? "Car wash overdue by" : "Car wash due in"}
      </Text>
      <View style={styles.row}>
        <TimerSegment
          unit="days"
          number={status.distance.days ?? 0}
          textStyle={textStyle}
        />
        <TimerSegment
          unit="hours"
          number={status.distance.hours ?? 0}
          textStyle={textStyle}
        />
        <TimerSegment
          unit="minutes"
          number={status.distance.minutes ?? 0}
          textStyle={textStyle}
        />
        <TimerSegment
          unit="seconds"
          number={status.distance.seconds ?? 0}
          textStyle={textStyle}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleComplete}
        disabled={isCompleting}
        style={[
          styles.button,
          isCompleting ? styles.buttonDisabled : undefined,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isCompleting, busy: isCompleting }}
      >
        <Text style={styles.buttonText}>{"I've washed the car"}</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.white,
    padding: 16,
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.color.white,
    justifyContent: "center",
    alignItems: "center",
  },
  containerLate: { backgroundColor: theme.color.red },
  whiteText: { color: theme.color.white },
  heading: {
    color: theme.color.black,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  row: { flexDirection: "row", marginBottom: 24 },
  buttonDisabled: { opacity: 0.5 },
  button: {
    backgroundColor: theme.color.black,
    padding: 8,
    borderRadius: 6,
    minHeight: 48,
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
