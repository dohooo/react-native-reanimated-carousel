import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { MAX_WIDTH, window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";
import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import type { ICarouselInstance, TCarouselProps } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";
import { Stack } from "tamagui";

function Index() {
  const scrollOffsetValue = useSharedValue<number>(0);
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
      width: window.width,
    },
  });

  const {
    width,
    height,
    style: advancedStyle,
    ...restSettings
  } = advancedSettings as {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
  } & TCarouselProps;

  const mergedStyle = React.useMemo<StyleProp<ViewStyle>>(
    () =>
      [
        typeof width === "number" || typeof height === "number" ? { width, height } : null,
        advancedStyle,
      ].filter(Boolean) as StyleProp<ViewStyle>[],
    [width, height, advancedStyle]
  );

  return (
    <Stack flex={1}>
      <CaptureWrapper>
        <Carousel
          {...restSettings}
          ref={ref}
          defaultScrollOffsetValue={scrollOffsetValue}
          testID={"xxx"}
          style={mergedStyle}
          onScrollStart={() => {
            console.log("Scroll start");
          }}
          onScrollEnd={() => {
            console.log("Scroll end");
          }}
          onConfigurePanGesture={(g: { enabled: (arg0: boolean) => any }) => {
            "worklet";
            g.enabled(false);
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
