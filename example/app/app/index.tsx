import { StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { useRouter } from "expo-router";

import { useColor } from "@/hooks/useColor";
import { routes } from "./routes";
import { Stack, Text } from "tamagui";

import * as MediaLibrary from "expo-media-library";
import { useEffect, useMemo } from "react";
import { IS_DEV } from "@/constants/env";
import { IS_WEB } from "@/constants/platform";

const ListItem = ({
  name,
  onPress,
  color,
}: {
  name: string;
  onPress: () => void;
  color: string;
}) => (
  <TouchableOpacity onPress={onPress}>
    <Stack style={styles.listItem}>
      <Text style={[styles.text, { color }]}>{name.split("-").join(" ")}</Text>
    </Stack>
  </TouchableOpacity>
);

const SectionHeader = ({ title, color }: { title: string; color: any }) => (
  <Stack style={[styles.section, { backgroundColor: color.background }]}>
    <Stack
      style={{
        width: 5,
        height: 20,
        backgroundColor: color.text,
        marginRight: 12,
      }}
    />
    <Text style={[styles.sectionText, { color: color.text }]}>{title}</Text>
  </Stack>
);

function upcaseLetter(string: string) {
  return string
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function Home() {
  const { colors } = useColor();
  const router = useRouter();
  const [status, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (status === null && IS_DEV && !IS_WEB) {
      requestPermission();
    }
  }, [status]);

  const renderSection = (
    title: string,
    kind: string,
    data: readonly {
      readonly name: string;
      readonly title: string;
    }[],
  ) => [
    <SectionHeader key={title} title={title} color={colors} />,
    ...data.map((item, index) => (
      <ListItem
        key={index}
        name={item.title}
        onPress={() => router.push(`/demos/${kind}/${item.name}` as any)}
        color={colors.text}
      />
    )),
  ];

  const stickyHeaderIndices = useMemo(
    () =>
      routes.reduce((acc, _, index) => {
        return [
          ...acc,
          typeof acc[index - 1] === "undefined"
            ? 0
            : acc[index - 1] + 1 + routes[index - 1].demos.length,
        ];
      }, [] as number[]),
    [routes],
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 64 }}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      {routes.map((route) => {
        const formattedKindName = upcaseLetter(route.kind);
        return renderSection(formattedKindName, route.kind, route.demos);
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listItem: {
    alignItems: "flex-start",
    borderColor: "#e8ecf0",
    borderBottomWidth: 0.5,
    padding: 16,
  },
  text: {
    fontSize: 16,
  },
  section: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
