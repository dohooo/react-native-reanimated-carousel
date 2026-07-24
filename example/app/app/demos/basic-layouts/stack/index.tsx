import * as React from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Carousel, CarouselRef } from "react-native-reanimated-carousel";

import { CustomSelectActionItem } from "@/components/ActionItems";
import { CarouselAdvancedSettingsPanel } from "@/components/CarouselAdvancedSettingsPanel";
import { defaultDataWith6Colors } from "@/components/CarouselBasicSettingsPanel";
import { window } from "@/constants/sizes";
import { useAdvancedSettings } from "@/hooks/useSettings";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { renderItem } from "@/utils/render-item";

function Index() {
  const viewCount = 5;
  const [mode, setMode] = React.useState<"horizontal-stack" | "vertical-stack">("horizontal-stack");
  const [snapDirection, setSnapDirection] = React.useState<"left" | "right">("left");
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

  const {
    style: advancedStyle,
    itemAnimation: _itemAnimation,
    layout: _layout,
    ...restSettings
  } = advancedSettings;

  const mergedStyle = React.useMemo<StyleProp<ViewStyle>>(
    () =>
      [
        { width: window.width, height: 258 },
        { alignItems: "center", justifyContent: "center" },
        advancedStyle,
      ].filter(Boolean) as StyleProp<ViewStyle>[],
    [advancedStyle]
  );

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          ref={ref}
          {...restSettings}
          style={mergedStyle}
          layout={{
            type: mode,
            exitDirection: snapDirection,
            spacing: mode === "vertical-stack" ? 8 : 18,
            visibleCount: viewCount,
          }}
          renderItem={renderItem({ rounded: true })}
        />
      </CaptureWrapper>

      <CarouselAdvancedSettingsPanel
        carouselRef={ref}
        advancedSettings={advancedSettings}
        onAdvancedSettingsChange={onAdvancedSettingsChange}
        extraSettings={[
          <CustomSelectActionItem
            key="change-mode"
            label="Change mode"
            value={mode}
            onValueChange={(value) => {
              setMode(value as "horizontal-stack" | "vertical-stack");
            }}
            options={[
              { label: "Horizontal Stack", value: "horizontal-stack" },
              { label: "Vertical Stack", value: "vertical-stack" },
            ]}
          />,
          <CustomSelectActionItem
            key="change-snap-direction"
            label="Change snap direction"
            value={snapDirection}
            onValueChange={(value) => {
              setSnapDirection(value as "left" | "right");
            }}
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />,
        ]}
      />
    </View>
  );
}

export default Index;
