import type { PropsWithChildren } from "react";
import React, { useState } from "react";
import type { AccessibilityRole, AccessibilityState, ViewStyle } from "react-native";
import { Pressable, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export type DotStyle = Omit<ViewStyle, "width" | "height"> & {
  width?: number;
  height?: number;
};

export type PaginationItemAccessibilityOverrides = {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
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
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
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
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
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

  const [isSelected, setIsSelected] = useState(false);
  const resolvedAccessibilityLabel = accessibilityLabel ?? `Slide ${index + 1} of ${count}`;
  const resolvedAccessibilityHint =
    accessibilityHint ?? (isSelected ? "" : `Go to ${resolvedAccessibilityLabel}`);
  const resolvedAccessibilityRole = accessibilityRole ?? "button";
  const resolvedAccessibilityState = accessibilityState ?? { selected: isSelected };

  useAnimatedReaction(
    () => animValue.value,
    (value) => {
      scheduleOnRN(setIsSelected, value === index);
    },
    [animValue, index]
  );

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
      accessibilityLabel={resolvedAccessibilityLabel}
      accessibilityRole={resolvedAccessibilityRole}
      accessibilityHint={resolvedAccessibilityHint}
      accessibilityState={resolvedAccessibilityState}
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
