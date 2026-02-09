import { Pressable, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { useRouter } from "expo-router";

import { useColor } from "@/hooks/useColor";
import { routes } from "@/utils/routes";
import { Stack, Text } from "tamagui";

import { IS_DEV } from "@/constants/env";
import { IS_WEB } from "@/constants/platform";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useMemo } from "react";

const ListItem = ({
  name,
  onPress,
  color,
  testID,
}: {
  name: string;
  onPress: () => void;
  color: string;
  testID?: string;
}) => (
  <TouchableOpacity onPress={onPress} testID={testID}>
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
    }[]
  ) => [
    <SectionHeader key={title} title={title} color={colors} />,
    ...data.map((item, index) => (
      <ListItem
        key={index}
        name={item.title}
        onPress={() => router.push(`/demos/${kind}/${item.name}` as any)}
        color={colors.text}
        testID={`demo-item-${item.name}`}
      />
    )),
  ];

  const visibleRoutes = useMemo(
    () => routes.filter((route) => !("hidden" in route && route.hidden)),
    [routes]
  );

  const stickyHeaderIndices = useMemo(
    () =>
      visibleRoutes.reduce((acc, _, index) => {
        return [
          // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
          ...acc,
          typeof acc[index - 1] === "undefined"
            ? 0
            : acc[index - 1] + 1 + visibleRoutes[index - 1].demos.length,
        ];
      }, [] as number[]),
    [visibleRoutes]
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 64 }}
      stickyHeaderIndices={stickyHeaderIndices}
    >
      {IS_DEV && !IS_WEB ? (
        <Pressable
          accessibilityLabel="navigate-e2e-comprehensive"
          style={styles.e2eTrigger}
          testID="navigate-e2e-comprehensive"
          onPress={() => router.push("/demos/e2e-testing/comprehensive" as any)}
        >
          <Text style={styles.e2eTriggerText}>E2E</Text>
        </Pressable>
      ) : null}
      {visibleRoutes.map((route) => {
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
  e2eTrigger: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1000,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  e2eTriggerText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
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
