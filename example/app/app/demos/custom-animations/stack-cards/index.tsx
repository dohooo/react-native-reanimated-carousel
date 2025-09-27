import * as React from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";
import { scheduleOnRN } from "react-native-worklets";

import { Arrow, ArrowDirection } from "@/components/StackCardsArrow";

import { window } from "@/constants/sizes";

function Index() {
  const headerHeight = 100;
  const PAGE_WIDTH = window.width;
  const PAGE_HEIGHT = window.height - headerHeight;
  const directionAnim = useSharedValue<ArrowDirection>(ArrowDirection.IS_VERTICAL);
  const [isVertical, setIsVertical] = React.useState(true);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";
      const isVertical = directionAnim.value === ArrowDirection.IS_VERTICAL;
      const STACK_SPACING = isVertical ? PAGE_HEIGHT * 0.08 : PAGE_WIDTH * 0.08;
      const translateY = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_HEIGHT, 0, STACK_SPACING],
        Extrapolation.CLAMP
      );
      const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH, 0, STACK_SPACING],
        Extrapolation.CLAMP
      );

      const opacity = value <= 0 ? 1 : interpolate(value, [0, 1], [1, 0], Extrapolation.CLAMP);

      const zIndex =
        value <= 0
          ? interpolate(value, [-1, 0], [0, 200], Extrapolation.CLAMP)
          : interpolate(value, [0, 1], [100, 0], Extrapolation.CLAMP);

      const scale = interpolate(value, [-1, 0, 1], [1, 1, 0.85], Extrapolation.CLAMP);

      return {
        transform: [isVertical ? { translateY } : { translateX }, { scale }],
        opacity,
        zIndex,
      };
    },
    [PAGE_HEIGHT, PAGE_WIDTH, directionAnim]
  );

  useAnimatedReaction(
    () => directionAnim.value,
    (direction) => {
      switch (direction) {
        case ArrowDirection.IS_VERTICAL:
          scheduleOnRN(setIsVertical, true);
          break;
        case ArrowDirection.IS_HORIZONTAL:
          scheduleOnRN(setIsVertical, false);
          break;
      }
    },
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
        vertical={isVertical}
        data={[...new Array(6).keys()]}
        renderItem={({ index, animationValue }) => (
          <Item
            key={index}
            index={index}
            animationValue={animationValue}
            directionAnim={directionAnim}
          />
        )}
        customAnimation={animationStyle}
      />
    </View>
  );
}

const Item: React.FC<{
  index: number;
  animationValue: SharedValue<number>;
  directionAnim: SharedValue<ArrowDirection>;
}> = ({ animationValue, directionAnim }) => {
  const maskStyle = useAnimatedStyle(() => {
    const zIndex = interpolate(animationValue.value, [-1, 0, 1], [300, 0, -300]);

    const backgroundColor = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ["transparent", "transparent", "rgba(0,0,0,0.3)"]
    );

    return {
      backgroundColor,
      zIndex,
    };
  }, [animationValue]);

  return (
    <View
      style={{
        backgroundColor: "white",
        flex: 1,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View style={[maskStyle, { position: "absolute", width: "100%", height: "100%" }]} />
      <Arrow directionAnim={directionAnim} />
    </View>
  );
};

export default Index;
