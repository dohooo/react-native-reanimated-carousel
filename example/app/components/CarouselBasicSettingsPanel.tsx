import { window } from "@/constants/sizes";
import * as React from "react";
import { TCarouselProps } from "react-native-reanimated-carousel";
import { YStack } from "tamagui";
import { CustomSelectActionItem, CustomSwitchActionItem } from "./ActionItems";

export const defaultDataWith6Colors = [
  "#B0604D",
  "#899F9C",
  "#B3C680",
  "#5C6265",
  "#F5D399",
  "#F1F1F1",
];

export const getDefaultBasicSettings: () => BasicSettings = () => {
  const settings = {
    vertical: false,
    pagingEnabled: true,
    snapEnabled: true,
    loop: true,
    autoPlay: false,
    autoPlayReverse: false,
    autoPlayInterval: 2000,
    data: defaultDataWith6Colors,
  };
  const demission = settings.vertical
    ? ({
        vertical: true,
      } as const)
    : ({
        vertical: false,
      } as const);

  return {
    ...settings,
    ...demission,
  };
};

export interface BasicSettings
  extends Pick<
    TCarouselProps,
    | "data"
    | "vertical"
    | "pagingEnabled"
    | "snapEnabled"
    | "loop"
    | "autoPlay"
    | "autoPlayInterval"
    | "autoPlayReverse"
    | "enabled"
  > {}

// This component is used to display basic properties, which are related to the basic properties of the carousel
export function CarouselBasicSettingsPanel({
  defaultSettings,
  onSettingChange,
}: {
  defaultSettings?: Partial<BasicSettings>;
  onSettingChange: (settings: Partial<BasicSettings>) => void;
}) {
  const [updatedSettings, setSettings] = React.useState(defaultSettings);

  const settings = React.useMemo(() => {
    return {
      ...getDefaultBasicSettings(),
      ...defaultSettings,
      ...updatedSettings,
    };
  }, [updatedSettings]);

  React.useEffect(() => {
    onSettingChange(settings);
  }, [settings]);

  const options: Array<
    | {
        label: string;
        key: keyof BasicSettings;
        type: "switch";
        value?: boolean;
        onValueChange: (value: boolean) => void;
      }
    | {
        label: string;
        key: keyof BasicSettings;
        type: "select";
        value?: string;
        placeholder?: string;
        onValueChange: (value: string) => void;
        options: { label: string; value: string }[];
      }
  > = [
    {
      label: "Enabled",
      key: "enabled",
      type: "switch",
      value: settings.enabled,
      onValueChange: (value: boolean) => setSettings({ ...settings, enabled: value }),
    },
    {
      label: "Set Vertical",
      key: "vertical",
      type: "switch",
      value: settings.vertical,
      onValueChange: (value: boolean) => setSettings({ ...settings, vertical: !!value as any }),
    },
    {
      label: "Paging Enabled",
      key: "pagingEnabled",
      type: "switch",
      value: settings.pagingEnabled,
      onValueChange: (value: boolean) => setSettings({ ...settings, pagingEnabled: value }),
    },
    {
      label: "Snap Enabled",
      key: "snapEnabled",
      type: "switch",
      value: settings.snapEnabled,
      onValueChange: (value: boolean) => setSettings({ ...settings, snapEnabled: value }),
    },
    {
      label: "Loop",
      key: "loop",
      type: "switch",
      value: settings.loop,
      onValueChange: (value: boolean) => setSettings({ ...settings, loop: value }),
    },
    {
      label: "Auto Play",
      key: "autoPlay",
      type: "switch",
      value: settings.autoPlay,
      onValueChange: (value: boolean) => setSettings({ ...settings, autoPlay: value }),
    },
    {
      label: "Auto Play Reverse",
      key: "autoPlayReverse",
      type: "switch",
      value: settings.autoPlayReverse,
      onValueChange: (value: boolean) => setSettings({ ...settings, autoPlayReverse: value }),
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
