import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Counter",
          headerRight: () => (
            <Link href="/counter/history" asChild>
              <Pressable hitSlop={20} accessibilityLabel="View history">
                <MaterialIcons name="history" size={32} color="gray" />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
