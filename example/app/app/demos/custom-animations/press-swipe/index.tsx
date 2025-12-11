import * as React from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import SButton from "@/components/SButton";
import { SlideItem } from "@/components/SlideItem";
import { PURPLE_IMAGES } from "@/constants/purple-images";
import { ElementsText, window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";

const PAGE_WIDTH = window.width;

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const pressAnim = useSharedValue<number>(0);
  const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
    "worklet";

    const zIndex = interpolate(value, [-1, 0, 1], [-1000, 0, 1000]);
    const translateX = interpolate(value, [-1, 0, 1], [-PAGE_WIDTH, 0, PAGE_WIDTH]);

    return {
      transform: [{ translateX }],
      zIndex,
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          loop={true}
          autoPlay={isAutoPlay}
          style={{ width: PAGE_WIDTH, height: 240 }}
          data={PURPLE_IMAGES}
          onScrollStart={() => {
            pressAnim.value = withTiming(1);
          }}
          onScrollEnd={() => {
            pressAnim.value = withTiming(0);
          }}
          renderItem={({ index }) => {
            return <CustomItem index={index} key={index} pressAnim={pressAnim} />;
          }}
          customAnimation={animationStyle}
          scrollAnimationDuration={1200}
        />
      </CaptureWrapper>
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
  pressAnim: SharedValue<number>;
  index: number;
}

const CustomItem: React.FC<ItemProps> = ({ pressAnim, index }) => {
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
      <SlideItem index={index} />
    </Animated.View>
  );
};

export default Index;
