import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { useSharedValue } from "react-native-reanimated";
import type { CarouselRef } from "react-native-reanimated-carousel";
import { Carousel } from "react-native-reanimated-carousel";
import { Stack } from "tamagui";

function Index() {
  const scrollOffsetValue = useSharedValue<number>(0);
  const ref = React.useRef<CarouselRef>(null);
  const { advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
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
