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

import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { fruitItems } from "../../utils/items";

const BlurView = Animated.createAnimatedComponent(_BlurView);

const PAGE_WIDTH = window.width / 2;

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);

  return (
    <View style={{ flex: 1 }}>
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
              source={item}
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
      [-1, 0, 1],
      [1, 0, 1],
    );

    return {
      opacity,
    };
  }, [animationValue]);

  return (
    <View
      style={{
        flex: 1,
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
