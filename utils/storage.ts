import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getFromStorage(key: string): Promise<unknown> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to read stored data", error);
    return null;
  }
}

export async function saveToStorage(key: string, data: object) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data", error);
  }
}
