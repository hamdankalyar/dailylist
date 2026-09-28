import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { theme } from "../theme";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.color.cerulean }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Shopping list",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: "Counter",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="idea"
        options={{
          title: "Idea",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
