import type { PropsWithChildren } from "react";
import React from "react";
import type { ViewStyle } from "react-native";
import { Pressable, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";

export type DotStyle = Omit<ViewStyle, "width" | "height"> & {
  width?: number;
  height?: number;
};

export const PaginationItem: React.FC<
  PropsWithChildren<{
    index: number;
    count: number;
    size?: number;
    animValue: Animated.SharedValue<number>;
    horizontal?: boolean;
    dotStyle?: DotStyle;
    activeDotStyle?: DotStyle;
    onPress: () => void;
    accessibilityLabel?: string;
  }>
> = (props) => {
  const {
    animValue,
    dotStyle,
    activeDotStyle,
    index,
    count,
    size,
    horizontal,
    children,
    onPress,
    accessibilityLabel,
  } = props;

  const defaultDotSize = 10;

  const sizes = {
    width: size || dotStyle?.width || defaultDotSize,
    height: size || dotStyle?.height || defaultDotSize,
  };

  /**
   * TODO: Keep this for future implementation
   * Used to change the size of the active dot with animation
   */
  // const animatedSize = {
  //   width: activeDotStyle?.width,
  //   height: activeDotStyle?.height,
  // };

  const width = sizes.width;
  const height = sizes.height;

  const animStyle = useAnimatedStyle(() => {
    const size = horizontal ? height : width;
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-size, 0, size];

    if (index === 0 && animValue?.value > count - 1) {
      inputRange = [count - 1, count, count + 1];
      outputRange = [-size, 0, size];
    }

    return {
      transform: [
        {
          translateX: interpolate(animValue?.value, inputRange, outputRange, Extrapolation.CLAMP),
        },
      ],
    };
  }, [animValue, index, count, horizontal]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={animValue.value === index ? "" : `Go to ${accessibilityLabel}`}
      accessibilityState={{ selected: animValue.value === index }}
    >
      <View
        style={[
          {
            width,
            height,
            overflow: "hidden",
            transform: [
              {
                rotateZ: horizontal ? "90deg" : "0deg",
              },
            ],
          },
          dotStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              backgroundColor: "black",
              flex: 1,
            },
            animStyle,
            activeDotStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Pressable>
  );
};
