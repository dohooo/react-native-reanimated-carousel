import * as React from "react";
import { ICarouselInstance } from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, YStack } from "tamagui";
import { CustomButtonActionItem, CustomSelectActionItem } from "./ActionItems";
import { BasicSettings, CarouselBasicSettingsPanel } from "./CarouselBasicSettingsPanel";

interface AdvancedSettings extends BasicSettings {
  data: string[];
}

// This component is used to display advanced operations that are not related to basic properties
export function CarouselAdvancedSettingsPanel({
  carouselRef,
  advancedSettings,
  onAdvancedSettingsChange,
  extraSettings,
  extraButtons,
}: {
  carouselRef: React.RefObject<ICarouselInstance>;
  advancedSettings: Partial<AdvancedSettings>;
  onAdvancedSettingsChange: (settings: Partial<AdvancedSettings>) => void;
  extraSettings?: React.ReactNode[];
  extraButtons?: React.ReactNode[];
}) {
  const { bottom } = useSafeAreaInsets();

  const [carouselSettings, setCarouselSettings] =
    React.useState<Partial<AdvancedSettings>>(advancedSettings);

  React.useEffect(() => {
    if (carouselSettings) {
      onAdvancedSettingsChange(carouselSettings);
    }
  }, [carouselSettings]);

  return (
    <ScrollView paddingHorizontal={"$2"} flex={1}>
      <YStack gap={"$2"} paddingBottom={bottom}>
        <CarouselBasicSettingsPanel
          defaultSettings={carouselSettings}
          onSettingChange={setCarouselSettings}
        />

        <CustomSelectActionItem
          label="Change data length"
          value={carouselSettings.data?.length?.toString() || "3"}
          onValueChange={(value) => {
            const num = Number(value);
            if (Number.isNaN(num)) return;
            const currentData = carouselSettings.data || [];
            const newData = Array(num)
              .fill(null)
              .map((_, index) => currentData[index % currentData.length]);
            setCarouselSettings({
              ...carouselSettings,
              data: newData,
            });
          }}
          options={[
            { label: "3", value: "3" },
            { label: "4", value: "4" },
            { label: "5", value: "5" },
            { label: "6", value: "6" },
            { label: "7", value: "7" },
            { label: "8", value: "8" },
          ]}
        />

        {extraSettings?.map((setting, index) => (
          <React.Fragment key={index}>{setting}</React.Fragment>
        ))}

        <CustomButtonActionItem
          label="Log current index"
          action={() => console.log(carouselRef.current?.getCurrentIndex())}
        />

        <CustomButtonActionItem
          label="Swipe to prev"
          action={() => carouselRef.current?.scrollTo({ count: -1, animated: true })}
        />

        <CustomButtonActionItem
          label="Swipe to next"
          action={() => carouselRef.current?.scrollTo({ count: 1, animated: true })}
        />

        {extraButtons?.map((button, index) => (
          <React.Fragment key={index}>{button}</React.Fragment>
        ))}
      </YStack>
    </ScrollView>
  );
}
