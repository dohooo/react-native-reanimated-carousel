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

import { SBItem } from "../../components/SBItem";
import SButton from "../../components/SButton";
import { ElementsText, HEADER_HEIGHT, window } from "../../constants";
import { fruitItems } from "../../utils/items";

const BlurView = Animated.createAnimatedComponent(_BlurView);

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const PAGE_WIDTH = window.width;
  const PAGE_HEIGHT = window.height - HEADER_HEIGHT;
  const ITEM_WIDTH = PAGE_WIDTH * 0.8;

  return (
    <View style={{ flex: 1 }}>
      <Carousel
        vertical
        loop={false}
        autoPlay={isAutoPlay}
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          alignItems: "center",
        }}
        width={ITEM_WIDTH}
        height={ITEM_WIDTH}
        pagingEnabled={false}
        snapEnabled={false}
        data={[...fruitItems, ...fruitItems]}
        renderItem={({ item, index, animationValue }) => {
          return (
            <CustomItem
              key={index}
              source={item}
              animationValue={animationValue}
            />
          );
        }}
        customAnimation={parallaxLayout(
          {
            size: ITEM_WIDTH,
          },
        )}
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
  source: ImageSourcePropType
  animationValue: Animated.SharedValue<number>
}
const CustomItem: React.FC<ItemProps> = ({ source, animationValue }) => {
  const maskStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [-0.5, 0, 1, 1.5],
      [1, 0, 0, 1],
    );

    return {
      opacity,
    };
  }, [animationValue]);

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
        <SBItem pretty style={{ flex: 1 }} />
      </View>
      <Image
        source={source}
        resizeMode={"contain"}
        style={{ width: "80%", height: "80%" }}
      />
      <BlurView
        intensity={50}
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, maskStyle]}
      />
    </View>
  );
};

export default Index;
