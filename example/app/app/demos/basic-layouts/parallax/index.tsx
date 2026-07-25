import * as React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Carousel, CarouselRef } from "react-native-reanimated-carousel";

import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import { Stack } from "tamagui";

const PAGE_WIDTH = window.width;

function Index() {
  const progress = useSharedValue<number>(0);
  const ref = React.useRef<CarouselRef>(null);
  const { advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
    // These values will be passed in the Carousel Component as default props
    defaultSettings: {
      autoplay: false,
      autoplayInterval: 2000,
      autoplayDirection: "forward",
      data: defaultDataWith6Colors,
      loop: true,
      orientation: "horizontal",
      snapMode: "page",
    },
  });
  const { itemAnimation: _itemAnimation, layout: _layout, ...carouselSettings } = advancedSettings;

  return (
    <Stack flex={1}>
      <CaptureWrapper>
        <Carousel
          ref={ref}
          {...carouselSettings}
          style={{
            width: PAGE_WIDTH,
            height: 258,
          }}
          layout={{
            type: "parallax",
            scale: 0.9,
            offset: 50,
          }}
          progress={progress}
          renderItem={renderItem({ rounded: true })}
        />
      </CaptureWrapper>

      <CarouselAdvancedSettingsPanel
        carouselRef={ref}
        advancedSettings={advancedSettings}
        onAdvancedSettingsChange={onAdvancedSettingsChange}
      />
    </Stack>
  );
}

export default Index;
