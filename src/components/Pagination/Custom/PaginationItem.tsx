import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import type { AccessibilityRole, AccessibilityState } from "react-native";
import { Pressable } from "react-native";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

type AnimatedDefaultStyle = ViewStyle | ImageStyle | TextStyle;

export type PaginationItemAccessibilityOverrides = {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

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
    customReanimatedStyle?: (
      progress: number,
      index: number,
      length: number
    ) => AnimatedDefaultStyle;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
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
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
  } = props;
  const customReanimatedStyleRef = useSharedValue<AnimatedDefaultStyle>({});
  const handleCustomAnimation = (progress: number) => {
    customReanimatedStyleRef.value = customReanimatedStyle?.(progress, index, count) ?? {};
  };

  const [isSelected, setIsSelected] = useState(false);
  const resolvedAccessibilityLabel = accessibilityLabel ?? `Slide ${index + 1} of ${count}`;
  const resolvedAccessibilityHint =
    accessibilityHint ?? (isSelected ? "" : `Go to ${resolvedAccessibilityLabel}`);
  const resolvedAccessibilityRole = accessibilityRole ?? "button";
  const resolvedAccessibilityState = accessibilityState ?? { selected: isSelected };

  useDerivedValue(() => {
    scheduleOnRN(handleCustomAnimation, animValue?.value);
  });

  useAnimatedReaction(
    () => animValue.value,
    (value) => {
      scheduleOnRN(setIsSelected, value === index);
    },
    [animValue, index]
  );

  const animStyle = useAnimatedStyle((): AnimatedDefaultStyle => {
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
      ] as AnimatedDefaultStyle["transform"],
    };
  }, [animValue, index, count, horizontal, dotStyle, activeDotStyle, customReanimatedStyle]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole={resolvedAccessibilityRole}
      accessibilityHint={resolvedAccessibilityHint}
      accessibilityState={resolvedAccessibilityState}
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
