import * as React from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { Arrow, ArrowDirection } from "./Arrow";

import { window } from "../../constants";

function Index() {
  const headerHeight = 100;
  const PAGE_WIDTH = window.width;
  const PAGE_HEIGHT = window.height - headerHeight;
  const directionAnim = useSharedValue<ArrowDirection>(
    ArrowDirection.IS_VERTICAL,
  );
  const [isVertical, setIsVertical] = React.useState(true);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";
      const translateY = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_HEIGHT, 0, 0],
      );

      const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH, 0, 0],
      );

      const zIndex = interpolate(value, [-1, 0, 1], [300, 0, -300]);

      const scale = interpolate(value, [-1, 0, 1], [1, 1, 0.85]);

      return {
        transform: [
          isVertical ? { translateY } : { translateX },
          { scale },
        ],
        zIndex,
      };
    },
    [PAGE_HEIGHT, PAGE_WIDTH, isVertical],
  );

  useAnimatedReaction(
    () => directionAnim.value,
    (direction) => {
      switch (direction) {
        case ArrowDirection.IS_VERTICAL:
          runOnJS(setIsVertical)(true);
          break;
        case ArrowDirection.IS_HORIZONTAL:
          runOnJS(setIsVertical)(false);
          break;
      }
    },
    [],
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
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
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
  index: number
  animationValue: Animated.SharedValue<number>
  directionAnim: Animated.SharedValue<ArrowDirection>
}> = ({ animationValue, directionAnim }) => {
  const maskStyle = useAnimatedStyle(() => {
    const zIndex = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [300, 0, -300],
    );

    const backgroundColor = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ["transparent", "transparent", "rgba(0,0,0,0.3)"],
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
      <Animated.View
        style={[
          maskStyle,
          { position: "absolute", width: "100%", height: "100%" },
        ]}
      />
      <Arrow directionAnim={directionAnim} />
    </View>
  );
};

export default Index;
