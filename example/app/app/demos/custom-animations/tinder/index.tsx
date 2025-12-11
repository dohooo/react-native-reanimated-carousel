import * as React from "react";
import { Image, ImageSourcePropType, View, ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import Carousel, { TAnimationStyle } from "react-native-reanimated-carousel";

import { window } from "@/constants/sizes";
import { CaptureWrapper } from "@/store/CaptureProvider";
import { getImages } from "@/utils/get-images";

const data = getImages();

function Index() {
  const headerHeight = 100;
  const PAGE_WIDTH = window.width;
  const PAGE_HEIGHT = window.height - headerHeight;

  const directionAnimVal = useSharedValue(0);

  const animationStyle: TAnimationStyle = React.useCallback(
    (value: number, index: number) => {
      "worklet";
      const translateY = interpolate(value, [0, 1], [0, -18]);

      const translateX =
        interpolate(value, [-1, 0], [PAGE_WIDTH, 0], Extrapolation.CLAMP) * directionAnimVal.value;

      const rotateZ =
        interpolate(value, [-1, 0], [15, 0], Extrapolation.CLAMP) * directionAnimVal.value;

      const zIndex = -10 * index;

      const scale = interpolate(value, [0, 1], [1, 0.95]);

      const opacity = interpolate(value, [-1, -0.8, 0, 1], [0, 0.9, 1, 0.85], Extrapolation.EXTEND);

      if (index === 0 || index === 1 || index === 2) {
        console.log(`index: ${index}, value: ${value}, zIndex: ${zIndex}`);
      }

      return {
        transform: [{ translateY }, { translateX }, { rotateZ: `${rotateZ}deg` }, { scale }],
        zIndex,
        opacity,
      };
    },
    [PAGE_HEIGHT, PAGE_WIDTH]
  );

  return (
    <View style={{ flex: 1 }}>
      <CaptureWrapper>
        <Carousel
          loop={false}
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            justifyContent: "center",
            alignItems: "center",
          }}
          defaultIndex={0}
          vertical={false}
          data={data}
          onConfigurePanGesture={(g) => {
            g.onChange((e) => {
              "worklet";
              directionAnimVal.value = Math.sign(e.translationX);
            });
          }}
          fixedDirection="negative"
          renderItem={({ index, item }) => (
            <Item key={index} img={item} style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} />
          )}
          customAnimation={animationStyle}
          windowSize={5}
        />
      </CaptureWrapper>
    </View>
  );
}

const Item: React.FC<{ img: ImageSourcePropType; style: ViewStyle }> = ({ img, style }) => {
  const width = window.width * 0.7;
  const height = window.height * 0.5;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, style]}
    >
      <View
        style={{
          width,
          height,
          borderWidth: 1,
          borderColor: "black",
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",

          shadowColor: "#000000d1",
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.51,
          shadowRadius: 13.16,
          elevation: 20,
        }}
      >
        <Image
          source={img}
          style={{
            width,
            height,
            borderRadius: 20,
          }}
        />
      </View>
    </Animated.View>
  );
};

export default Index;
