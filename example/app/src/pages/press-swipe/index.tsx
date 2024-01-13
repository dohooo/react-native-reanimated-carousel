import * as React from "react";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { ImageItems } from "../../utils/items";

const PAGE_WIDTH = window.width;

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const pressAnim = useSharedValue<number>(0);
  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const zIndex = interpolate(value, [-1, 0, 1], [-1000, 0, 1000]);
      const translateX = interpolate(
        value,
        [-1, 0, 1],
        [-PAGE_WIDTH, 0, PAGE_WIDTH],
      );

      return {
        transform: [{ translateX }],
        zIndex,
      };
    },
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        loop={true}
        autoPlay={isAutoPlay}
        style={{ width: PAGE_WIDTH, height: 240 }}
        width={PAGE_WIDTH}
        data={[...ImageItems, ...ImageItems]}
        onScrollStart={() => {
          pressAnim.value = withTiming(1);
        }}
        onScrollEnd={() => {
          pressAnim.value = withTiming(0);
        }}
        renderItem={({ index, item }) => {
          return (
            <CustomItem
              source={item}
              key={index}
              pressAnim={pressAnim}
            />
          );
        }}
        customAnimation={animationStyle}
        scrollAnimationDuration={1200}
      />
      <SButton
        onPress={() => {
          setIsAutoPlay(!isAutoPlay);
        }}
      >
        {ElementsText.AUTOPLAY}:{`${isAutoPlay}`}
      </SButton>
    </View>
  );
}

interface ItemProps {
  pressAnim: Animated.SharedValue<number>
  source: ImageSourcePropType
}

const CustomItem: React.FC<ItemProps> = ({ pressAnim, source }) => {
  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressAnim.value, [0, 1], [1, 0.9]);
    const borderRadius = interpolate(pressAnim.value, [0, 1], [0, 30]);

    return {
      transform: [{ scale }],
      borderRadius,
    };
  }, []);

  return (
    <Animated.View style={[{ flex: 1, overflow: "hidden" }, animStyle]}>
      <Animated.Image
        source={source}
        resizeMode="center"
        style={{ width: "100%", height: "100%" }}
      />
    </Animated.View>
  );
};

export default Index;
