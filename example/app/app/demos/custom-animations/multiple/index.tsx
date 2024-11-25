import * as React from "react";
import { View } from "react-native";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";

const PAGE_WIDTH = window.width;

const COUNT = 4;

function Index() {
  const ref = React.useRef<ICarouselInstance>(null);
  const { advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
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
      width: PAGE_WIDTH / COUNT,
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          ref={ref}
          {...advancedSettings}
          loop={false}
          overscrollEnabled={false}
          style={{ width: PAGE_WIDTH }}
          data={[...new Array(6).keys()]}
          renderItem={({ index }) => <SBItem key={index} index={index} />}
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
