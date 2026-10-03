import { StyleSheet, Text, View, type TextStyle } from "react-native";
import { theme } from "../theme";

type Props = {
  number: number;
  unit: string;
  textStyle?: TextStyle;
};

export function TimerSegment({ number, unit, textStyle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.number, textStyle]}>{number}</Text>
      <Text style={[styles.unit, textStyle]}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  number: { fontSize: 32, fontWeight: "bold", color: theme.color.black },
  unit: { fontSize: 14, color: theme.color.black },
});
