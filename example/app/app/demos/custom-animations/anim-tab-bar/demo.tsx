import { ElementsText, window } from "@/constants/sizes";
import { useToggleButton } from "@/hooks/useToggleButton";
import * as React from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { ICarouselInstance } from "react-native-reanimated-carousel";
import Carousel from "react-native-reanimated-carousel";

const PAGE_WIDTH = 60;
const PAGE_HEIGHT = 40;
const DATA = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Index() {
  const r = React.useRef<ICarouselInstance>(null);
  const AutoPLay = useToggleButton({
    defaultValue: false,
    buttonTitle: ElementsText.AUTOPLAY,
  });

  return (
    <View
      style={{ paddingVertical: 100, alignItems: "center" }}
      id="carousel-component"
      dataSet={{ kind: "custom-animations", name: "anim-tab-bar" }}
    >
      <View
        style={{
          width: window.width,
          height: PAGE_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#002a57",
        }}
      >
        <Carousel
          ref={r}
          loop
          style={{
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
          }}
          data={DATA}
          renderItem={({ item, animationValue }) => {
            return (
              <Item
                animationValue={animationValue}
                label={item}
                onPress={() =>
                  r.current?.scrollTo({
                    count: animationValue.value,
                    animated: true,
                  })
                }
              />
            );
          }}
          autoPlay={AutoPLay.status}
        />
      </View>
    </View>
  );
}

export default Index;

interface Props {
  animationValue: SharedValue<number>;
  label: string;
  onPress?: () => void;
}

const Item: React.FC<Props> = (props) => {
  const { animationValue, label, onPress } = props;

  const translateY = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  }, [animationValue]);

  const labelStyle = useAnimatedStyle(() => {
    const scale = interpolate(animationValue.value, [-1, 0, 1], [1, 1.25, 1], Extrapolation.CLAMP);

    const color = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ["#ffffff", "#002a57", "#ffffff"]
    );

    return {
      transform: [{ scale }, { translateY: translateY.value }],
      color,
    };
  }, [animationValue, translateY]);

  const onPressIn = React.useCallback(() => {
    translateY.value = withTiming(-8, { duration: 250 });
  }, [translateY]);

  const onPressOut = React.useCallback(() => {
    translateY.value = withTiming(0, { duration: 250 });
  }, [translateY]);

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          {
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          },
          containerStyle,
        ]}
      >
        <Animated.Text style={[{ fontSize: 18, color: "#f1f1f1" }, labelStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};
