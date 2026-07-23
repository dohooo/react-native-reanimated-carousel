import { BasicSettings, getDefaultBasicSettings } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import * as React from "react";
import { CarouselProps } from "react-native-reanimated-carousel";

interface AdvancedSettings extends BasicSettings {
  data: string[];
}

const constants = {
  PAGE_WIDTH: window.width,
};

export function useAdvancedSettings(
  options: {
    defaultSettings?: Partial<AdvancedSettings>;
  } = {}
) {
  const { defaultSettings = {} } = options;
  const [advancedSettings, setAdvancedSettings] =
    React.useState<Partial<CarouselProps<string>>>(defaultSettings);

  return {
    advancedSettings: {
      ...getDefaultBasicSettings(),
      ...advancedSettings,
    } as CarouselProps<string>,
    onAdvancedSettingsChange: setAdvancedSettings,
    constants,
  };
}
