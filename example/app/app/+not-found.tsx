import { Link, Stack as RouterStack } from "expo-router";
import { StyleSheet } from "react-native";
import { Stack, Text } from "tamagui";

export default function NotFoundScreen() {
  return (
    <>
      <RouterStack.Screen options={{ title: "Oops!" }} />
      <Stack style={styles.container}>
        <Text style={styles.title}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link} replace>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
