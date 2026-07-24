import React from "react";
import type { ColorValue, ViewStyle } from "react-native";
import { Pressable, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import type { PaginationDotStyle, PaginationProps } from "../../public-types";
import { getNearestLoopPosition, getSettledRawIndex } from "../../utils/carousel-math";

const DEFAULT_DOT_SIZE = 10;
const DEFAULT_DOT_COLOR = "#D1D5DB";
const DEFAULT_ACTIVE_DOT_COLOR = "#111827";

export function getPaginationDotDistance(progress: number, index: number, count: number): number {
  "worklet";

  if (!Number.isFinite(progress) || count <= 0) return 0;
  return Math.abs(getNearestLoopPosition(index, progress, count) - progress);
}

export function getPaginationSelectedIndex(progress: number, count: number): number {
  "worklet";

  return getSettledRawIndex(progress, count);
}

function interpolateDotColor(
  distance: number,
  active: ColorValue,
  inactive: ColorValue
): ColorValue {
  "worklet";

  if (typeof active !== "string" || typeof inactive !== "string") {
    return distance < 0.5 ? active : inactive;
  }

  return interpolateColor(distance, [0, 1], [active, inactive]) as ColorValue;
}

export function PaginationItem(props: {
  activeDotStyle?: PaginationDotStyle;
  count: number;
  dotStyle?: PaginationDotStyle;
  index: number;
  label?: string;
  onPress?: (index: number) => void;
  progress: PaginationProps["progress"];
}) {
  const { activeDotStyle, count, dotStyle, index, label, onPress, progress } = props;

  const baseWidth = dotStyle?.width ?? DEFAULT_DOT_SIZE;
  const baseHeight = dotStyle?.height ?? DEFAULT_DOT_SIZE;
  const baseBorderRadius = dotStyle?.borderRadius ?? Math.min(baseWidth, baseHeight) / 2;
  const baseBorderWidth = dotStyle?.borderWidth ?? 0;
  const baseBorderColor = dotStyle?.borderColor ?? "transparent";
  const baseBackgroundColor = dotStyle?.backgroundColor ?? DEFAULT_DOT_COLOR;
  const baseOpacity = dotStyle?.opacity ?? 1;

  const activeWidth = activeDotStyle?.width ?? baseWidth;
  const activeHeight = activeDotStyle?.height ?? baseHeight;
  const activeBorderRadius = activeDotStyle?.borderRadius ?? baseBorderRadius;
  const activeBorderWidth = activeDotStyle?.borderWidth ?? baseBorderWidth;
  const activeBorderColor = activeDotStyle?.borderColor ?? baseBorderColor;
  const activeBackgroundColor = activeDotStyle?.backgroundColor ?? DEFAULT_ACTIVE_DOT_COLOR;
  const activeOpacity = activeDotStyle?.opacity ?? baseOpacity;

  const [selected, setSelected] = React.useState(
    count === 1 || getPaginationSelectedIndex(progress.value, count) === index
  );

  useAnimatedReaction(
    () => count === 1 || getPaginationSelectedIndex(progress.value, count) === index,
    (nextSelected, previousSelected) => {
      if (nextSelected !== previousSelected) {
        scheduleOnRN(setSelected, nextSelected);
      }
    },
    [count, index, progress]
  );

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const distance = Math.min(1, getPaginationDotDistance(progress.value, index, count));

    return {
      width: interpolate(distance, [0, 1], [activeWidth, baseWidth], Extrapolation.CLAMP),
      height: interpolate(distance, [0, 1], [activeHeight, baseHeight], Extrapolation.CLAMP),
      borderRadius: interpolate(
        distance,
        [0, 1],
        [activeBorderRadius, baseBorderRadius],
        Extrapolation.CLAMP
      ),
      borderWidth: interpolate(
        distance,
        [0, 1],
        [activeBorderWidth, baseBorderWidth],
        Extrapolation.CLAMP
      ),
      borderColor: interpolateDotColor(distance, activeBorderColor, baseBorderColor),
      backgroundColor: interpolateDotColor(distance, activeBackgroundColor, baseBackgroundColor),
      opacity: interpolate(distance, [0, 1], [activeOpacity, baseOpacity], Extrapolation.CLAMP),
    };
  }, [
    activeBackgroundColor,
    activeBorderColor,
    activeBorderRadius,
    activeBorderWidth,
    activeHeight,
    activeOpacity,
    activeWidth,
    baseBackgroundColor,
    baseBorderColor,
    baseBorderRadius,
    baseBorderWidth,
    baseHeight,
    baseOpacity,
    baseWidth,
    count,
    index,
    progress,
  ]);

  const reservedStyle: ViewStyle = {
    alignItems: "center",
    height: Math.max(baseHeight, activeHeight),
    justifyContent: "center",
    width: Math.max(baseWidth, activeWidth),
  };
  const dot = <Animated.View style={animatedStyle} />;

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={label ?? `Slide ${index + 1} of ${count}`}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => onPress(index)}
        style={reservedStyle}
      >
        {dot}
      </Pressable>
    );
  }

  return (
    <View
      accessibilityElementsHidden
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={reservedStyle}
    >
      {dot}
    </View>
  );
}
