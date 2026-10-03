import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LibraryIcon } from "./LibraryIcon";
import { theme } from "../theme";

type Props = {
  name: string;
  isCompleted?: boolean;
  onDelete: () => void;
  onToggleComplete: () => void;
};

export function ShoppingListItem({
  name,
  isCompleted = false,
  onDelete,
  onToggleComplete,
}: Props) {
  const handleDelete = () => {
    Alert.alert(
      "Are you sure you want to delete this?",
      "It will be gone for good.",
      [
        {
          text: "Yes",
          onPress: onDelete,
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
    <View
      style={[
        styles.itemContainer,
        isCompleted ? styles.completedContainer : undefined,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggleComplete}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={name}
        hitSlop={12}
      >
        <Text
          style={[
            styles.itemText,
            isCompleted ? styles.completedText : undefined,
          ]}
        >
          {name}
        </Text>
      </TouchableOpacity>
      {isCompleted && <LibraryIcon />}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={handleDelete}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  completedContainer: {
    backgroundColor: "#eee",
  },
  completedText: {
    textDecorationLine: "line-through",
    textDecorationColor: "gray",
    color: "gray",
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
