import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { ShoppingListItem } from "../components/ShoppingListItem";
import { theme } from "../theme";
import { getFromStorage, saveToStorage } from "../utils/storage";

type ShoppingListItemType = {
  id: string;
  name: string;
  isCompleted?: boolean;
};

const storageKey = "shopping-list";

export default function App() {
  const [value, setValue] = useState("");
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getFromStorage(storageKey);
      if (Array.isArray(data)) {
        setShoppingList(data);
      }
      setIsLoading(false);
    };

    fetchInitial();
  }, []);

  const handleSubmit = () => {
    if (value && !isLoading) {
      const newShoppingList = [
        // ponytail: timestamp ids can collide within a millisecond; use UUIDs if needed.
        { id: new Date().toISOString(), name: value },
        ...shoppingList,
      ];

      setShoppingList(newShoppingList);
      saveToStorage(storageKey, newShoppingList);
      setValue("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "pink" }]} />
      <FlatList
        data={shoppingList}
        contentContainerStyle={styles.contentContainer}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          <ShoppingListItem name={item.name} isCompleted={item.isCompleted} />
        )}
        ListHeaderComponent={
          <TextInput
            style={styles.textInput}
            accessibilityLabel="New shopping list item"
            placeholder="e.g Coffee"
            editable={!isLoading}
            value={value}
            onChangeText={setValue}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        }
        ListEmptyComponent={
          <View style={styles.listEmptyContainer}>
            <Text>Your shopping list is empty</Text>
          </View>
        }
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.white,
  },
  contentContainer: {
    paddingTop: 12,
  },
  textInput: {
    backgroundColor: theme.color.white,
    borderColor: theme.color.lightGray,
    borderWidth: 2,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    fontSize: 18,
    borderRadius: 50,
  },
  listEmptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 18,
  },
});
