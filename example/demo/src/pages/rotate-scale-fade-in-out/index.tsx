import * as React from "react";
import { View } from "react-native";
import { interpolate } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { SBItem } from "../../components/SBItem";
import { ElementsText, window } from "../../constants";
import { useToggleButton } from "../../hooks/useToggleButton";

const scale = 0.8;
const PAGE_WIDTH = window.width * scale;
const PAGE_HEIGHT = 240 * scale;

function Index() {
  const AutoPLay = useToggleButton({
    defaultValue: false,
    buttonTitle: ElementsText.AUTOPLAY,
  });

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
      const scale = interpolate(value, [-1, 0, 1], [1.25, 1, 0.25]);
      const rotateZ = `${interpolate(
        value,
        [-1, 0, 1],
        [-45, 0, 45],
      )}deg`;
      const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH, 0, PAGE_WIDTH],
      );
      const opacity = interpolate(value, [-0.75, 0, 1], [0, 1, 0]);

      return {
        transform: [{ scale }, { rotateZ }, { translateX }],
        zIndex,
        opacity,
      };
    },
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop
        style={{
          width: window.width,
          height: 240,
          justifyContent: "center",
          alignItems: "center",
        }}
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        data={[...new Array(6).keys()]}
        renderItem={({ index }) => {
          return <SBItem key={index} index={index} />;
        }}
        autoPlay={AutoPLay.status}
        customAnimation={animationStyle}
      />
      {AutoPLay.button}
    </View>
  );
}

export default Index;
