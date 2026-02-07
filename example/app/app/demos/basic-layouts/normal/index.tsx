import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { useSharedValue } from "react-native-reanimated";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { Stack } from "tamagui";

function Index() {
  const scrollOffsetValue = useSharedValue<number>(0);
  const ref = React.useRef<ICarouselInstance>(null);
  const { advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
    defaultSettings: {
      autoPlay: false,
      autoPlayInterval: 2000,
      autoPlayReverse: false,
      data: defaultDataWith6Colors,
      loop: true,
      pagingEnabled: true,
      snapEnabled: true,
      vertical: false,
    },
  });

  return (
    <Stack flex={1}>
      <CaptureWrapper>
        <Carousel
          {...advancedSettings}
          ref={ref}
          scrollOffsetValue={scrollOffsetValue}
          testID={"normal-carousel"}
          style={{
            height: 258,
            width: window.width,
          }}
          onScrollStart={() => {
            console.log("Scroll start");
          }}
          onScrollEnd={() => {
            console.log("Scroll end");
          }}
          onSnapToItem={(index: number) => console.log("current index:", index)}
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
