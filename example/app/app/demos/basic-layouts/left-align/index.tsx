import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

function Index() {
  const ref = React.useRef<ICarouselInstance>(null);
  const { constants, advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
    // These values will be passed in the Carousel Component as default props
    defaultSettings: {
      autoPlay: false,
      autoPlayInterval: 2000,
      autoPlayReverse: false,
      data: defaultDataWith6Colors,
      height: 258,
      loop: true,
      pagingEnabled: true,
      snapEnabled: true,
      vertical: false,
      width: 430,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          {...advancedSettings}
          ref={ref}
          style={{ width: "100%" }}
          width={constants.PAGE_WIDTH * 0.75}
          onSnapToItem={(index) => console.log("current index:", index)}
          renderItem={renderItem({ rounded: true, style: { marginRight: 8 } })}
        />
      </CaptureWrapper>

      <CarouselAdvancedSettingsPanel
        carouselRef={ref}
        advancedSettings={advancedSettings}
        onAdvancedSettingsChange={onAdvancedSettingsChange}
      />
    </View>
  );
}

export default Index;
