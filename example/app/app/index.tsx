import { StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { useRouter } from "expo-router";

import { useColor } from "@/hooks/useColor";
import {
  CustomAnimationsDemos,
  ExperimentDemos,
  LayoutsDemos,
} from "./demos/routes";
import { Stack, Text } from "tamagui";

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

export default function Home() {
  const { colors } = useColor();
  const router = useRouter();

  const renderSection = (
    title: string,
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
        onPress={() => router.push(`/demos/${item.name}` as any)}
        color={colors.text}
      />
    )),
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 64 }}
      stickyHeaderIndices={[
        0,
        LayoutsDemos.length + 1,
        LayoutsDemos.length + CustomAnimationsDemos.length + 2,
      ]}
    >
      {renderSection("Layouts", LayoutsDemos)}
      {renderSection("Custom Animations", CustomAnimationsDemos)}
      {renderSection("Experiments", ExperimentDemos)}
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
