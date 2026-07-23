import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Carousel } from "react-native-reanimated-carousel";

import { BlurView as _BlurView } from "expo-blur";

import { parallaxLayout } from "@/features/custom-animations/blur-rotate/parallax";

import SButton from "@/components/SButton";
import { SlideItem } from "@/components/SlideItem";
import { PURPLE_IMAGES } from "@/constants/purple-images";
import { ElementsText, window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";

const BlurView = Animated.createAnimatedComponent(_BlurView);

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const PAGE_WIDTH = window.width;
  const ITEM_WIDTH = PAGE_WIDTH * 0.8;

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          orientation="vertical"
          loop={false}
          autoplay={isAutoPlay}
          style={{
            width: PAGE_WIDTH,
            height: ITEM_WIDTH,
          }}
          contentContainerStyle={{
            width: PAGE_WIDTH,
            height: ITEM_WIDTH,
          }}
          snapMode="none"
          data={PURPLE_IMAGES}
          renderItem={({ index, relativeProgress }) => {
            return <CustomItem key={index} index={index} relativeProgress={relativeProgress} />;
          }}
          itemAnimation={parallaxLayout({
            size: ITEM_WIDTH,
          })}
          animation={{ type: "timing", duration: 1200 }}
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
  relativeProgress: SharedValue<number>;
}
const CustomItem: React.FC<ItemProps> = ({ index, relativeProgress }) => {
  const maskStyle = useAnimatedStyle(() => {
    const opacity = interpolate(relativeProgress.value, [-0.5, 0, 1, 1.5], [1, 0, 0, 1]);

    return {
      opacity,
    };
  }, [relativeProgress]);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 30,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%", height: "100%", position: "absolute" }}>
        <SlideItem index={index} />
      </View>

      <BlurView intensity={50} pointerEvents="none" style={[StyleSheet.absoluteFill, maskStyle]} />
    </View>
  );
};

export default Index;
