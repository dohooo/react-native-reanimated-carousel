import * as React from "react";
import { View } from "react-native";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { renderItem } from "@/utils/render-item";

function Index() {
  const ref = React.useRef<ICarouselInstance>(null);
  const { constants, advancedSettings, onAdvancedSettingsChange } =
    useAdvancedSettings();

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        {...advancedSettings}
        ref={ref}
        style={{ width: "100%" }}
        width={constants.PAGE_WIDTH * 0.75}
        onSnapToItem={(index) => console.log("current index:", index)}
        renderItem={renderItem({ rounded: true, style: { marginRight: 8 } })}
      />

      <CarouselAdvancedSettingsPanel
        carouselRef={ref}
        advancedSettings={advancedSettings}
        onAdvancedSettingsChange={onAdvancedSettingsChange}
      />
    </View>
  );
}

export default Index;
