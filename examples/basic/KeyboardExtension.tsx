import { Button, StyleSheet, Text, View } from "react-native";
import { addText } from "expo-keyboard-extension";
export default function KeyboardExtension({ url }: { url: string }) {
  console.log("Keyboard!");

  return (
    <View style={styles.container}>
      <Text
        style={{ fontFamily: "Inter-Black", fontSize: 24, marginBottom: 10 }}
      >
        Changes?
      </Text>

      <Button title="Add Text" onPress={() => addText("Hello World")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
    justifyContent: "center",
    padding: 30,
  },
});
