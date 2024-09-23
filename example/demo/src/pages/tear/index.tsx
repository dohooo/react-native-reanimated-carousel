import * as React from "react";
import type { ImageSourcePropType } from "react-native";
import { View } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import SButton from "../../components/SButton";
import { ElementsText, window } from "../../constants";
import { ImageItems } from "../../utils/items";

const PAGE_WIDTH = window.width;

function Index() {
  const [isAutoPlay, setIsAutoPlay] = React.useState(false);
  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number) => {
      "worklet";

      const zIndex = interpolate(value, [-1, 0, 1], [300, 0, -300]);
      const translateX = interpolate(value, [-1, 0, 1], [0, 0, 0]);

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
        renderItem={({ index, item, animationValue }) => {
          return (
            <Item
              key={index}
              width={PAGE_WIDTH}
              animationValue={animationValue}
              imageSource={item}
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
  width: number
  animationValue: Animated.SharedValue<number>
  imageSource: ImageSourcePropType
}
const Item: React.FC<ItemProps> = ({ width, imageSource, animationValue }) => {
  const leftStyle = useAnimatedStyle(() => {
    const left = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [-(width / 2), 0, 0],
      Extrapolate.CLAMP,
    );
    return {
      left,
    };
  }, [animationValue, width]);

  const rightStyle = useAnimatedStyle(() => {
    const right = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [-(width / 2), 0, 0],
      Extrapolate.CLAMP,
    );

    return {
      right,
    };
  }, [animationValue, width]);

  return (
    <View style={{ position: "absolute", height: "100%", width }}>
      <Animated.View
        style={[
          {
            left: 0,
            position: "absolute",
            width: width / 2,
            height: "100%",
            overflow: "hidden",
          },
          leftStyle,
        ]}
      >
        <Animated.Image
          source={imageSource}
          style={{
            width,
            height: "100%",
            left: 0,
            position: "absolute",
          }}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            right: 0,
            position: "absolute",
            width: width / 2,
            height: "100%",
            overflow: "hidden",
          },
          rightStyle,
        ]}
      >
        <Animated.Image
          source={imageSource}
          style={{
            width,
            height: "100%",
            right: 0,
            position: "absolute",
          }}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

export default Index;
