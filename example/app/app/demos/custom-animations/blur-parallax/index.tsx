import * as React from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

import { BlurView as _BlurView } from "expo-blur";

import { parallaxLayout } from "./parallax";

import SButton from "@/components/SButton";
import { ElementsText, window } from "@/constants/sizes";
import { fruitItems } from "@/utils/items";
import { SlideItem } from "@/components/SlideItem";
import { CaptureWrapper } from "@/store/CaptureProvider";

const BlurView = Animated.createAnimatedComponent(_BlurView);

const PAGE_WIDTH = window.width / 2;

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          loop={true}
          autoPlay={isAutoPlay}
          style={{
            width: window.width,
            height: 240,
            justifyContent: "center",
            alignItems: "center",
          }}
          width={PAGE_WIDTH}
          data={[...fruitItems, ...fruitItems]}
          renderItem={({ item, index, animationValue }) => {
            return (
              <CustomItem
                key={index}
                index={index}
                animationValue={animationValue}
              />
            );
          }}
          customAnimation={parallaxLayout(
            {
              size: PAGE_WIDTH,
              vertical: false,
            },
            {
              parallaxScrollingScale: 1,
              parallaxAdjacentItemScale: 0.5,
              parallaxScrollingOffset: 40,
            },
          )}
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
  index: number;
  animationValue: Animated.SharedValue<number>;
}
const CustomItem: React.FC<ItemProps> = ({ index, animationValue }) => {
  const maskStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animationValue.value, [-1, 0, 1], [1, 0, 1]);

    return {
      opacity,
    };
  }, [animationValue]);

  return (
    <View
      style={{
        flex: 1,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
      }}
    >
      <View style={{ flex: 1, width: "100%" }}>
        <SlideItem index={index} rounded />
      </View>
      <BlurView
        intensity={50}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, maskStyle]}
      />
    </View>
  );
};

export default Index;
