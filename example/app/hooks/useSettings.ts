import * as React from "react";
import { TCarouselProps } from "react-native-reanimated-carousel";
import {
  BasicSettings,
  getDefaultBasicSettings,
} from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";

interface AdvancedSettings extends BasicSettings {
  data: string[];
}

const constants = {
  PAGE_WIDTH: window.width,
};

export function useAdvancedSettings(
  options: {
    defaultSettings?: Partial<AdvancedSettings>;
  } = {},
) {
  const { defaultSettings = {} } = options;
  const [advancedSettings, setAdvancedSettings] =
    React.useState<Partial<TCarouselProps>>(defaultSettings);

  return {
    advancedSettings: {
      ...getDefaultBasicSettings(),
      ...advancedSettings,
    } as TCarouselProps,
    onAdvancedSettingsChange: setAdvancedSettings,
    constants,
  };
}
