import * as React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { SBItem } from "@/components/SBItem";
import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { withAnchorPoint } from "@/utils/anchor-point";

const count = 4;

function Index() {
  const size = window.width / 4;

  return (
    <CaptureWrapper>
      <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {Array.from({
          length: count * 3,
        }).map((_, i) => {
          return (
            <View key={i} style={{ width: size, height: size }}>
              <CubeItem />
            </View>
          );
        })}
      </View>
    </CaptureWrapper>
  );
}

function CubeItem() {
  const PAGE_WIDTH = window.width / 4;
  const PAGE_HEIGHT = PAGE_WIDTH;
  const animationStyle = React.useCallback<TAnimationStyle>(
    (value: number) => {
      "worklet";
      const zIndex = interpolate(value, [-1, 0, 1], [-1000, 0, -1000]);

      const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH, 0, PAGE_WIDTH],
        Extrapolation.CLAMP
      );

      const scale = interpolate(value, [-1, 0, 1], [0.49, 1, 0.49], Extrapolation.CLAMP);

      const perspective = interpolate(
        value,
        [-1, 0, 1],
        [PAGE_WIDTH * 0.89, PAGE_WIDTH * 1.5, PAGE_WIDTH * 0.89],
        Extrapolation.CLAMP
      );

      const rotateY = `${interpolate(value, [-1, 0, 1], [-90, 0, 90], Extrapolation.CLAMP)}deg`;

      const transform = {
        transform: [{ scale }, { translateX }, { perspective }, { rotateY }],
      };

      return {
        ...withAnchorPoint(
          transform,
          { x: 0.5, y: 0.5 },
          { width: PAGE_WIDTH, height: PAGE_HEIGHT }
        ),
        zIndex,
      };
    },
    [PAGE_HEIGHT, PAGE_WIDTH]
  );

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop={true}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
        }}
        pagingEnabled={false}
        snapEnabled={false}
        data={[...new Array(6).keys()]}
        renderItem={({ index, animationValue }) => {
          return <CustomItem key={index} index={index} animationValue={animationValue} />;
        }}
        customAnimation={animationStyle}
        scrollAnimationDuration={1200}
        autoPlay
      />
    </View>
  );
}

interface ItemProps {
  index: number;
  animationValue: SharedValue<number>;
}
const CustomItem: React.FC<ItemProps> = ({ index, animationValue }) => {
  const maskStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ["#000000dd", "transparent", "#000000dd"]
    );

    return {
      backgroundColor,
    };
  }, [animationValue]);

  return (
    <View style={{ flex: 1 }}>
      <SBItem rounded={false} pretty key={index} index={index} style={{ borderRadius: 0 }} />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          maskStyle,
        ]}
      />
    </View>
  );
};

export default Index;
