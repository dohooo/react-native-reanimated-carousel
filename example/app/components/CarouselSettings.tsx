import * as React from "react";
import { View, Text, Button } from "react-native";
import { CustomSelectActionItem, CustomSwitchActionItem } from "./ActionItems";
import { TCarouselProps } from "react-native-reanimated-carousel";
import { YStack, Label } from "tamagui";

export function CarouselSettings({
  defaultSettings = {
    vertical: false,
    pagingEnabled: true,
    autoPlay: false,
    autoPlayInterval: 2000,
  },
  onSettingChange,
}: {
  defaultSettings?: Partial<TCarouselProps>;
  onSettingChange: (settings: Partial<TCarouselProps>) => void;
}) {
  const [settings, setSettings] =
    React.useState<Partial<TCarouselProps>>(defaultSettings);

  React.useEffect(() => {
    onSettingChange(settings);
  }, [settings]);

  const options: Array<
    | {
        label: string;
        key: keyof Partial<TCarouselProps>;
        type: "switch";
        value?: boolean;
        onValueChange: (value: boolean) => void;
      }
    | {
        label: string;
        key: keyof Partial<TCarouselProps>;
        type: "select";
        value?: string;
        placeholder?: string;
        onValueChange: (value: string) => void;
        options: { label: string; value: string }[];
      }
  > = [
    {
      label: "Set Vertical",
      key: "vertical",
      type: "switch",
      value: settings.vertical,
      onValueChange: (value: boolean) =>
        setSettings({ ...settings, vertical: !!value as any }),
    },
    {
      label: "Paging Enabled",
      key: "pagingEnabled",
      type: "switch",
      value: settings.pagingEnabled,
      onValueChange: (value: boolean) =>
        setSettings({ ...settings, pagingEnabled: value }),
    },
    {
      label: "Auto Play",
      key: "autoPlay",
      type: "switch",
      value: settings.autoPlay,
      onValueChange: (value: boolean) =>
        setSettings({ ...settings, autoPlay: value }),
    },
    {
      label: "Interval",
      key: "autoPlayInterval",
      type: "select",
      value: settings.autoPlayInterval?.toString() ?? "",
      placeholder: "Select Auto Play Interval",
      options: [
        { label: "200ms", value: "200" },
        { label: "1000ms", value: "1000" },
        { label: "2000ms", value: "2000" },
        { label: "3000ms", value: "3000" },
      ],
      onValueChange: (value: string) =>
        setSettings({ ...settings, autoPlayInterval: Number(value) }),
    },
  ];

  return (
    <YStack>
      {options.map((item, itemIndex) => {
        switch (item.type) {
          case "switch":
            return (
              <CustomSwitchActionItem
                key={itemIndex}
                label={item.label}
                value={item.value ?? false}
                onValueChange={item.onValueChange}
              />
            );
          case "select":
            return (
              <CustomSelectActionItem
                key={itemIndex}
                label={item.label}
                options={item.options}
                value={item.value ?? ""}
                onValueChange={item.onValueChange}
              />
            );
        }
      })}
    </YStack>
  );
}
