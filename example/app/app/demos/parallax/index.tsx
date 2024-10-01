import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { window } from "@/constants/Sizes";
import { renderItem } from "@/utils/render-item";
import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { Stack } from "tamagui";

const PAGE_WIDTH = window.width;

function Index() {
  const progress = useSharedValue<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);
  const { advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
    defaultSettings: {
      autoPlay: false,
      autoPlayInterval: 2000,
      autoPlayReverse: false,
      data: ["#26292E", "#899F9C", "#B3C680", "#5C6265", "#F5D399", "#F1F1F1"],
      height: 258,
      loop: true,
      pagingEnabled: true,
      snapEnabled: true,
      vertical: false,
      width: 430,
    },
  });

  return (
    <Stack flex={1}>
      <Carousel
        ref={ref}
        {...advancedSettings}
        style={{
          width: PAGE_WIDTH,
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onProgressChange={progress}
        renderItem={renderItem({ rounded: true })}
      />

      <CarouselAdvancedSettingsPanel
        carouselRef={ref}
        advancedSettings={advancedSettings}
        onAdvancedSettingsChange={onAdvancedSettingsChange}
      />
    </Stack>
  );
}

export default Index;
