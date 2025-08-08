import type { PropsWithChildren } from "react";
import React from "react";
import { Pressable } from "react-native";
import type { ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  runOnJS,
  useSharedValue,
  useDerivedValue,
} from "react-native-reanimated";

import type { DefaultStyle } from "react-native-reanimated/lib/typescript/reanimated2/hook/commonTypes";

export type DotStyle = Omit<ViewStyle, "width" | "height" | "backgroundColor" | "borderRadius"> & {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
};

export const PaginationItem: React.FC<
  PropsWithChildren<{
    index: number;
    count: number;
    size?: number;
    animValue: SharedValue<number>;
    horizontal?: boolean;
    dotStyle?: DotStyle;
    activeDotStyle?: DotStyle;
    onPress: () => void;
    customReanimatedStyle?: (progress: number, index: number, length: number) => DefaultStyle;
    accessibilityLabel?: string;
  }>
> = (props) => {
  const defaultDotSize = 10;
  const {
    animValue,
    dotStyle,
    activeDotStyle,
    index,
    count,
    size,
    horizontal,
    children,
    customReanimatedStyle,
    onPress,
    accessibilityLabel,
  } = props;
  const customReanimatedStyleRef = useSharedValue<DefaultStyle>({});
  const handleCustomAnimation = (progress: number) => {
    customReanimatedStyleRef.value = customReanimatedStyle?.(progress, index, count) ?? {};
  };

  useDerivedValue(() => {
    runOnJS(handleCustomAnimation)(animValue?.value);
  });

  const animStyle = useAnimatedStyle((): DefaultStyle => {
    const {
      width = size || defaultDotSize,
      height = size || defaultDotSize,
      borderRadius,
      backgroundColor = "#FFF",
      ...restDotStyle
    } = dotStyle ?? {};
    const {
      width: activeWidth = width,
      height: activeHeight = height,
      borderRadius: activeBorderRadius,
      backgroundColor: activeBackgroundColor = "#000",
      ...restActiveDotStyle
    } = activeDotStyle ?? {};
    let val = Math.abs(animValue?.value - index);
    if (index === 0 && animValue?.value > count - 1) val = Math.abs(animValue?.value - count);

    const inputRange = [0, 1, 2];
    const restStyle = (val === 0 ? restActiveDotStyle : restDotStyle) ?? {};

    return {
      width: interpolate(val, inputRange, [activeWidth, width, width], Extrapolation.CLAMP),
      height: interpolate(val, inputRange, [activeHeight, height, height], Extrapolation.CLAMP),
      borderRadius: interpolate(
        val,
        inputRange,
        [activeBorderRadius ?? borderRadius ?? 0, borderRadius ?? 0, borderRadius ?? 0],
        Extrapolation.CLAMP
      ),
      backgroundColor: interpolateColor(val, inputRange, [
        activeBackgroundColor,
        backgroundColor,
        backgroundColor,
      ]),
      ...restStyle,
      ...(customReanimatedStyleRef.value ?? {}),
      transform: [
        ...(restStyle?.transform ?? []),
        ...(customReanimatedStyleRef.value?.transform ?? []),
      ] as DefaultStyle["transform"],
    };
  }, [animValue, index, count, horizontal, dotStyle, activeDotStyle, customReanimatedStyle]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={animValue.value === index ? "" : `Go to ${accessibilityLabel}`}
      accessibilityState={{ selected: animValue.value === index }}
    >
      <Animated.View
        style={[
          {
            overflow: "hidden",
            transform: [
              {
                rotateZ: horizontal ? "90deg" : "0deg",
              },
            ],
          },
          dotStyle,
          animStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
