import { window } from "@/constants/sizes";
import * as React from "react";
import { CarouselProps } from "react-native-reanimated-carousel";
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
  return {
    orientation: "horizontal",
    snapMode: "page",
    loop: true,
    autoplay: false,
    autoplayDirection: "forward",
    autoplayInterval: 2000,
    data: defaultDataWith6Colors,
    scrollEnabled: true,
  };
};

export interface BasicSettings
  extends Pick<
    CarouselProps<string>,
    | "data"
    | "orientation"
    | "snapMode"
    | "loop"
    | "autoplay"
    | "autoplayInterval"
    | "autoplayDirection"
    | "scrollEnabled"
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
      key: "scrollEnabled",
      type: "switch",
      value: settings.scrollEnabled,
      onValueChange: (value: boolean) => setSettings({ ...settings, scrollEnabled: value }),
    },
    {
      label: "Orientation",
      key: "orientation",
      type: "select",
      value: settings.orientation,
      options: [
        { label: "Horizontal", value: "horizontal" },
        { label: "Vertical", value: "vertical" },
      ],
      onValueChange: (value: string) =>
        setSettings({ ...settings, orientation: value as BasicSettings["orientation"] }),
    },
    {
      label: "Snap Mode",
      key: "snapMode",
      type: "select",
      value: settings.snapMode,
      options: [
        { label: "Page", value: "page" },
        { label: "Nearest", value: "nearest" },
        { label: "None", value: "none" },
      ],
      onValueChange: (value: string) =>
        setSettings({ ...settings, snapMode: value as BasicSettings["snapMode"] }),
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
      key: "autoplay",
      type: "switch",
      value: settings.autoplay,
      onValueChange: (value: boolean) => setSettings({ ...settings, autoplay: value }),
    },
    {
      label: "Auto Play Direction",
      key: "autoplayDirection",
      type: "select",
      value: settings.autoplayDirection,
      options: [
        { label: "Forward", value: "forward" },
        { label: "Backward", value: "backward" },
      ],
      onValueChange: (value: string) =>
        setSettings({
          ...settings,
          autoplayDirection: value as BasicSettings["autoplayDirection"],
        }),
    },
    {
      label: "Interval",
      key: "autoplayInterval",
      type: "select",
      value: settings.autoplayInterval?.toString() ?? "",
      placeholder: "Select Auto Play Interval",
      options: [
        { label: "200ms", value: "200" },
        { label: "1000ms", value: "1000" },
        { label: "2000ms", value: "2000" },
        { label: "3000ms", value: "3000" },
      ],
      onValueChange: (value: string) =>
        setSettings({ ...settings, autoplayInterval: Number(value) }),
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
