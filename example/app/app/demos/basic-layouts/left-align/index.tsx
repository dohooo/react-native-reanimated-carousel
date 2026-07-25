import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import { View } from "react-native";
import type { CarouselRef } from "react-native-reanimated-carousel";
import { Carousel } from "react-native-reanimated-carousel";

function Index() {
  const ref = React.useRef<CarouselRef>(null);
  const { constants, advancedSettings, onAdvancedSettingsChange } = useAdvancedSettings({
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

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          {...advancedSettings}
          ref={ref}
          style={{ width: window.width, height: 258, overflow: "visible" }}
          itemSize={window.width / 2}
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
